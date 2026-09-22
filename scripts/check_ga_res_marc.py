#!/usr/bin/env python3
"""
30-second check: why A/RES/{session}/293|294 may be missing while 295 is present.

Compares MARC source fields that refresh_ga.py filters on:
  - 791$a  (resolution symbol)
  - 791$c  (session)
  - 992    (action date / YYYY-MM)

Also checks DynamicListings for existing docs.

Connection matches refresh_ga.py:
  - SSM param uatISSU-admin-connect-string
  - MARC DB: undlFiles
  - App DB: DynamicListings

Usage:
  python scripts/check_ga_res_marc.py
  python scripts/check_ga_res_marc.py --session 80 --year 2026 --month 6
  python scripts/check_ga_res_marc.py --symbols 293 294 295
"""

from __future__ import annotations

import argparse
import sys

import boto3
from pymongo import MongoClient


def connect():
    from dlx import DB

    client = boto3.client("ssm", region_name="us-east-1")
    connect_string = client.get_parameter(
        Name="uatISSU-admin-connect-string", WithDecryption=True
    )["Parameter"]["Value"]

    # Same DBs refresh_ga.py uses
    DB.connect(connect_string, database="undlFiles")
    mongo = MongoClient(connect_string)
    print("Connected to MARC db=undlFiles and app db=DynamicListings (via SSM)")
    return mongo["DynamicListings"]


def inspect_symbol(session: str, number: str) -> dict:
    from dlx.marc import BibSet, Query

    symbol = f"A/RES/{session}/{number}"
    query_string = f'791__a:"{symbol}"'
    query = Query.from_string(query_string)
    bibs = list(BibSet.from_query(query))

    if not bibs:
        return {
            "symbol": symbol,
            "found": False,
            "bib_count": 0,
            "bib_ids": [],
            "791a": [],
            "791c": [],
            "992": [],
            "all": [],
        }

    rows = []
    for bib in bibs:
        vals_992 = list(bib.get_values("992", "a") or [])
        if not vals_992:
            # fallback if subfield accessor differs
            try:
                vals_992 = list(bib.get_values("992") or [])
            except Exception:
                vals_992 = []
        rows.append(
            {
                "bib_id": bib.id,
                "791a": list(bib.get_values("791", "a") or []),
                "791c": list(bib.get_values("791", "c") or []),
                "992": vals_992,
            }
        )

    return {
        "symbol": symbol,
        "found": True,
        "bib_count": len(rows),
        "bib_ids": [r["bib_id"] for r in rows],
        "791a": rows[0]["791a"],
        "791c": rows[0]["791c"],
        "992": rows[0]["992"],
        "all": rows,
    }


def matches_refresh_query(info: dict, session: str, year: int, month: int) -> tuple[bool, str]:
    if not info["found"]:
        return False, "not in MARC source (no bib for this 791$a)"

    monthstr = str(month).zfill(2)
    yyyymm = f"{year}-{monthstr}"

    has_session_symbol = any(f"A/RES/{session}/" in str(v) for v in info["791a"])
    has_session_c = any(str(v).strip() == str(session) for v in info["791c"])
    has_month = any(yyyymm in str(v) for v in info["992"])

    reasons = []
    if not has_session_symbol:
        reasons.append(f"791$a does not contain A/RES/{session}/ (got {info['791a']!r})")
    if not has_session_c:
        reasons.append(f"791$c is not {session!r} (got {info['791c']!r})")
    if not has_month:
        reasons.append(f"992 does not contain {yyyymm!r} (got {info['992']!r})")

    if reasons:
        return False, "; ".join(reasons)
    return True, f"matches refresh query for session={session}, 992~{yyyymm}"


def run_month_query(session: str, year: int, month: int) -> list[str]:
    from dlx.marc import BibSet, Query

    monthstr = str(month).zfill(2)
    query_string = (
        f'791__a:"A/RES/{session}/" AND 791__c:"{session}" '
        f'AND 992:"{year}-{monthstr}"'
    )
    print(f"\nRefresh query (same as refresh_ga.py):\n  {query_string}")
    query = Query.from_string(query_string)
    symbols = []
    for bib in BibSet.from_query(query, sort={"791.subfields.value": -1}):
        vals = list(bib.get_values("791", "a") or [])
        symbols.extend(vals)
    return symbols


def check_app_db(app_db, session: str, numbers: list[str]) -> None:
    coll = app_db["dl_ga_res_data_collection"]
    print("\n=== DynamicListings (dl_ga_res_data_collection) ===")
    for number in numbers:
        symbol = f"A/RES/{session}/{number}"
        doc = coll.find_one(
            {"Resolution": symbol},
            {"Resolution": 1, "refresh": 1, "listing_id": 1, "date_en": 1},
        )
        if not doc:
            print(f"\n{symbol}")
            print("  present in app DB: False")
            continue
        print(f"\n{symbol}")
        print("  present in app DB: True")
        print(f"  refresh          : {doc.get('refresh')}")
        print(f"  listing_id       : {doc.get('listing_id')}")
        print(f"  date_en          : {doc.get('date_en')}")

    # Neighbor window helps spot permanent gaps (e.g. 292 then 295).
    try:
        center = int(numbers[0])
        lo, hi = center - 5, center + 10
    except Exception:
        return

    print(f"\n=== App DB neighbors A/RES/{session}/{lo}..{hi} ===")
    prefix = f"A/RES/{session}/"
    docs = list(
        coll.find(
            {"Resolution": {"$regex": f"^{prefix}\\d+$"}},
            {"Resolution": 1, "date_en": 1, "refresh": 1},
        )
    )

    def num_of(sym: str):
        try:
            return int(sym.rsplit("/", 1)[-1])
        except Exception:
            return None

    by_num = {num_of(d["Resolution"]): d for d in docs if num_of(d["Resolution"]) is not None}
    for n in range(lo, hi + 1):
        d = by_num.get(n)
        sym = f"{prefix}{n}"
        if d:
            print(f"  {sym} | {d.get('date_en')} | refresh={d.get('refresh')}")
        else:
            print(f"  {sym} | MISSING")


def main():
    parser = argparse.ArgumentParser(description="Diagnose missing GA resolutions in MARC source")
    parser.add_argument("--session", default="80")
    parser.add_argument("--year", type=int, default=2026)
    parser.add_argument("--month", type=int, default=6)
    parser.add_argument(
        "--symbols",
        nargs="+",
        default=["293", "294", "295"],
        help="Resolution numbers to inspect",
    )
    args = parser.parse_args()

    app_db = connect()

    print("\n=== Per-symbol MARC inspection ===")
    for number in args.symbols:
        info = inspect_symbol(args.session, number)
        ok, reason = matches_refresh_query(info, args.session, args.year, args.month)

        print(f"\n{info['symbol']}")
        print(f"  found in MARC : {info['found']} (bibs={info['bib_count']}, ids={info['bib_ids']})")
        if info["found"]:
            print(f"  791$a        : {info['791a']}")
            print(f"  791$c        : {info['791c']}")
            print(f"  992         : {info['992']}")
            if info["bib_count"] > 1:
                for row in info["all"][1:]:
                    print(f"  --- other bib {row['bib_id']} ---")
                    print(f"  791$a        : {row['791a']}")
                    print(f"  791$c        : {row['791c']}")
                    print(f"  992         : {row['992']}")
        print(f"  would refresh: {ok}")
        print(f"  reason       : {reason}")

    symbols = run_month_query(args.session, args.year, args.month)
    wanted = {f"A/RES/{args.session}/{n}" for n in args.symbols}
    matched = [s for s in symbols if s in wanted]
    missing = sorted(wanted - set(symbols))

    print("\n=== Month query hit list (wanted symbols) ===")
    print(f"  total bibs returned by month query: {len(symbols)}")
    print(f"  wanted symbols present           : {matched or '(none)'}")
    print(f"  wanted symbols missing           : {missing or '(none)'}")

    high = sorted(
        {s for s in symbols if s.startswith(f"A/RES/{args.session}/")},
        key=lambda s: int(s.rsplit("/", 1)[-1]) if s.rsplit("/", 1)[-1].isdigit() else -1,
        reverse=True,
    )[:15]
    print("\n=== Highest symbols returned by that month query (up to 15) ===")
    for s in high:
        print(f"  {s}")

    check_app_db(app_db, args.session, args.symbols)
    print("\nDone.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        raise
