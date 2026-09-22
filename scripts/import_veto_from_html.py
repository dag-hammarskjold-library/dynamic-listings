#!/usr/bin/env python3
"""
Import SC veto table rows from the three public HTML files into MongoDB.

Example:
  cd /Users/JOB/Documents/DEVS/dynamic-listings
  DLX_REST_LOCAL=True ./venv/bin/python scripts/import_veto_from_html.py \\
    --en /Users/JOB/Desktop/veto/scact_veto_table_en.htm \\
    --fr /Users/JOB/Desktop/veto/scact_veto_table_fr.htm \\
    --es /Users/JOB/Desktop/veto/scact_veto_table_es.htm

Uses the same Mongo connection pattern as the Flask app (DATABASE_CONN / SSM when DLX_REST_LOCAL).
"""

from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from dl.veto_html_import import (  # noqa: E402
    VETO_DEFAULT_LISTING_ID,
    import_veto_records_from_html_files,
)


def _mongodb_client() -> MongoClient:
    load_dotenv()
    uri = os.getenv("DATABASE_CONN") or os.getenv("MONGO_CS")
    if os.environ.get("DLX_REST_LOCAL"):
        try:
            import boto3

            uri = boto3.client("ssm", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")).get_parameter(
                Name="uatISSU-admin-connect-string",
                WithDecryption=True,
            )["Parameter"]["Value"]
        except Exception as exc:
            print(f"Could not load Mongo URI from SSM for local dev: {exc}")
    if not uri:
        raise RuntimeError("DATABASE_CONN (or MONGO_CS) is not configured")
    return MongoClient(uri)


def main() -> int:
    parser = argparse.ArgumentParser(description="Import SC veto records from EN/FR/ES HTML tables.")
    parser.add_argument("--en", required=True, help="Path to scact_veto_table_en.htm")
    parser.add_argument("--fr", required=True, help="Path to scact_veto_table_fr.htm")
    parser.add_argument("--es", required=True, help="Path to scact_veto_table_es.htm")
    parser.add_argument("--listing", default=VETO_DEFAULT_LISTING_ID, help="Mongo listing_id")
    parser.add_argument("--dry-run", action="store_true", help="Parse only; do not write to MongoDB")
    conflict = parser.add_mutually_exclusive_group()
    conflict.add_argument(
        "--force",
        action="store_true",
        help="Insert duplicate when Veto_id already exists (same as --on-conflict duplicate)",
    )
    conflict.add_argument(
        "--update-existing",
        action="store_true",
        help="Update existing records when Veto_id already exists for this listing",
    )
    args = parser.parse_args()
    on_conflict = "skip"
    if args.force:
        on_conflict = "duplicate"
    elif args.update_existing:
        on_conflict = "update"

    client = _mongodb_client()
    collection = client["DynamicListings"]["dl_veto_data_collection"]

    stats = import_veto_records_from_html_files(
        collection,
        en_path=args.en,
        fr_path=args.fr,
        es_path=args.es,
        listing_id=args.listing,
        dry_run=args.dry_run,
        on_conflict=on_conflict,
    )

    print(
        f"parsed={stats['parsed']} inserted={stats['inserted']} updated={stats['updated']} "
        f"skipped={stats['skipped']} errors={stats['errors']} dry_run={args.dry_run} on_conflict={on_conflict}"
    )
    return 0 if stats["errors"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
