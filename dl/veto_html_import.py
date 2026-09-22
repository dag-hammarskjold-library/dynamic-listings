"""
Parse SC veto listing HTML tables (EN/FR/ES) into MongoDB documents with GA-style
prefix / text / sufix / link fields for link columns.
"""

from __future__ import annotations

import datetime
import re
from html import unescape
from typing import Any

VETO_LINK_COLUMNS = ("draft", "written_record", "agenda_item")
VETO_PLAIN_COLUMNS = ("date", "negative_vote")
VETO_COLUMN_ORDER = ("date", "draft", "written_record", "agenda_item", "negative_vote")
VETO_LANG_FILES = {"en": "en", "fr": "fr", "es": "es"}
VETO_DEFAULT_LISTING_ID = "sc_veto_list"

MONTHS_EN = {
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "may": 5,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}

SYMBOL_RE = re.compile(r"(S/(?:PV\.|[\d/A-Za-z.-]+))", re.IGNORECASE)
ANCHOR_RE = re.compile(
    r'<a\s[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL,
)
TD_RE = re.compile(r"<td[^>]*>(.*?)</td>", re.IGNORECASE | re.DOTALL)
TR_RE = re.compile(r"<tr[^>]*>(.*?)</tr>", re.IGNORECASE | re.DOTALL)
BR_TAG_RE = re.compile(r"<\s*br\s*/?\s*>", re.IGNORECASE)


def veto_per_lang_field_names() -> list[str]:
    """Plain columns: one field per language. Link columns: prefix, text, sufix, link."""
    names: list[str] = []
    for col in VETO_PLAIN_COLUMNS:
        for lang in ("en", "fr", "es"):
            names.append(f"{col}_{lang}")
    for col in VETO_LINK_COLUMNS:
        for lang in ("en", "fr", "es"):
            names.extend(
                [
                    f"{col}_prefix_{lang}",
                    f"{col}_{lang}",
                    f"{col}_sufix_{lang}",
                    f"{col}_link_{lang}",
                ]
            )
    return names


def veto_legacy_html_field_unset() -> dict[str, str]:
    """Mongo $unset map for deprecated *_html_* keys on link columns."""
    return {f"{col}_html_{lang}": "" for col in VETO_LINK_COLUMNS for lang in ("en", "fr", "es")}


def empty_veto_document() -> dict[str, Any]:
    doc = {name: "" for name in veto_per_lang_field_names()}
    doc["Veto_id"] = ""
    doc["sort_date"] = ""
    doc["listing_id"] = ""
    return doc


def strip_tags(value: str) -> str:
    return re.sub(r"<[^>]+>", "", value or "").strip()


def normalize_break_tags(value: str) -> str:
    return BR_TAG_RE.sub("<br>", value or "")


def normalize_cell_html(inner: str) -> str:
    text = unescape(inner or "")
    text = normalize_break_tags(text.replace("</br>", "<br>"))
    return text.strip()


def td_to_field_parts(inner: str, *, linkable: bool) -> dict[str, str]:
    html = normalize_cell_html(inner)
    if not linkable:
        return {"prefix": "", "text": html, "sufix": "", "link": ""}

    anchors = list(ANCHOR_RE.finditer(html))
    if not anchors:
        return {"prefix": "", "text": strip_tags(html), "sufix": "", "link": ""}

    first = anchors[0]
    link = first.group(1).strip()
    anchor_text = normalize_cell_html(first.group(2))
    text = strip_tags(anchor_text)

    before = html[: first.start()]
    after = html[first.end() :]
    prefix = strip_tags(before)
    sufix = normalize_cell_html(after).strip()

    multi = len(anchors) > 1 or "<br" in html.lower() or sufix
    if multi:
        return {"prefix": "", "text": html, "sufix": "", "link": ""}

    return {"prefix": prefix, "text": text, "sufix": sufix, "link": link}


def apply_parts_to_document(doc: dict[str, Any], col: str, lang: str, parts: dict[str, str]) -> None:
    if col in VETO_PLAIN_COLUMNS:
        doc[f"{col}_{lang}"] = parts.get("text") or ""
        return
    doc[f"{col}_prefix_{lang}"] = parts.get("prefix") or ""
    doc[f"{col}_{lang}"] = parts.get("text") or ""
    doc[f"{col}_sufix_{lang}"] = parts.get("sufix") or ""
    doc[f"{col}_link_{lang}"] = parts.get("link") or ""


def compose_veto_cell_html(record: dict[str, Any], base: str, lang: str) -> str:
    if base in VETO_PLAIN_COLUMNS:
        return normalize_break_tags(record.get(f"{base}_{lang}") or "")

    legacy = record.get(f"{base}_{lang}") or ""
    link = record.get(f"{base}_link_{lang}") or ""
    prefix = record.get(f"{base}_prefix_{lang}") or ""
    text = record.get(f"{base}_{lang}") or ""
    sufix = record.get(f"{base}_sufix_{lang}") or ""

    if legacy and "<" in legacy and not link and not prefix and not sufix:
        return normalize_break_tags(legacy)

    if link and text:
        return normalize_break_tags(f'{prefix}<a target="_top" href="{link}">{text}</a>{sufix}')
    return normalize_break_tags(f"{prefix}{text or legacy}{sufix}")


def parse_veto_table_rows(html_content: str) -> list[list[str]]:
    rows: list[list[str]] = []
    for tr_match in TR_RE.finditer(html_content):
        tr_inner = tr_match.group(1)
        if re.search(r"<th[\s>]", tr_inner, re.IGNORECASE):
            continue
        if "tbltitle" in tr_inner.lower() or 'class="title"' in tr_inner.lower():
            continue
        tds = TD_RE.findall(tr_inner)
        if len(tds) != 5:
            continue
        rows.append([normalize_cell_html(td) for td in tds])
    return rows


def extract_primary_veto_id(*cells: str) -> str:
    for cell in cells:
        for match in SYMBOL_RE.finditer(cell):
            sym = match.group(1).strip().rstrip(")")
            sym = re.sub(r"\s+", "", sym)
            if sym.upper().startswith("S/") and "PV." not in sym.upper():
                return sym
    for cell in cells:
        match = SYMBOL_RE.search(cell)
        if match:
            return re.sub(r"\s+", "", match.group(1).strip())
    return ""


def parse_en_display_date_to_iso(date_text: str) -> str:
    """Best-effort ISO date from English display strings in the EN table."""
    raw = strip_tags(date_text)
    if not raw:
        return ""

    cleaned = raw.replace(",", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"^(\d{1,2})-(\d{1,2})\s", r"\1 \2 ", cleaned)

    tokens = cleaned.split()
    if len(tokens) < 3:
        return ""

    day_token = tokens[0]
    month_token = tokens[1].lower()
    year_token = tokens[-1]

    if not year_token.isdigit():
        return ""

    day_digits = re.findall(r"\d+", day_token)
    if not day_digits:
        return ""
    day = int(day_digits[0])
    month = MONTHS_EN.get(month_token)
    if not month:
        return ""
    year = int(year_token)
    try:
        return datetime.date(year, month, day).isoformat()
    except ValueError:
        return ""


def build_veto_document_from_row(
    cells_by_lang: dict[str, list[str]],
    *,
    listing_id: str,
) -> dict[str, Any]:
    doc = empty_veto_document()
    doc["listing_id"] = listing_id

    en_cells = cells_by_lang.get("en") or []
    doc["sort_date"] = parse_en_display_date_to_iso(en_cells[0]) if en_cells else ""

    draft_cells = []
    for lang in ("en", "fr", "es"):
        cells = cells_by_lang.get(lang) or []
        for col_index, col in enumerate(VETO_COLUMN_ORDER):
            if col_index >= len(cells):
                continue
            inner = cells[col_index]
            linkable = col in VETO_LINK_COLUMNS
            parts = td_to_field_parts(inner, linkable=linkable)
            apply_parts_to_document(doc, col, lang, parts)
            if col == "draft" and lang == "en":
                draft_cells.append(inner)

    veto_id = extract_primary_veto_id(*(draft_cells or [""]))
    if not veto_id and en_cells:
        veto_id = extract_primary_veto_id(en_cells[1] if len(en_cells) > 1 else "")
    doc["Veto_id"] = veto_id or f"veto_{doc['sort_date'] or 'unknown'}"
    return doc


def merge_veto_rows_by_language(
    rows_by_lang: dict[str, list[list[str]]],
) -> list[dict[str, list[str]]]:
    master = rows_by_lang.get("en") or []
    merged: list[dict[str, list[str]]] = []
    for index, en_row in enumerate(master):
        merged.append(
            {
                "en": en_row,
                "fr": rows_by_lang["fr"][index] if index < len(rows_by_lang["fr"]) else en_row,
                "es": rows_by_lang["es"][index] if index < len(rows_by_lang["es"]) else en_row,
            }
        )
    return merged


def parse_veto_html_strings(
    en_content: str,
    fr_content: str,
    es_content: str,
) -> list[dict[str, list[str]]]:
    rows_by_lang = {
        "en": parse_veto_table_rows(en_content),
        "fr": parse_veto_table_rows(fr_content),
        "es": parse_veto_table_rows(es_content),
    }
    return merge_veto_rows_by_language(rows_by_lang)


def parse_veto_html_files(
    en_path: str,
    fr_path: str,
    es_path: str,
) -> list[dict[str, list[str]]]:
    paths = {"en": en_path, "fr": fr_path, "es": es_path}
    rows_by_lang: dict[str, list[list[str]]] = {}
    for lang, path in paths.items():
        with open(path, encoding="utf-8", errors="replace") as handle:
            rows_by_lang[lang] = parse_veto_table_rows(handle.read())
    return merge_veto_rows_by_language(rows_by_lang)


VETO_IMPORT_ON_CONFLICT = ("skip", "update", "duplicate")


def import_veto_records_from_html_files(
    collection,
    *,
    en_path: str,
    fr_path: str,
    es_path: str,
    listing_id: str = "sc_veto_list",
    dry_run: bool = False,
    on_conflict: str = "skip",
    skip_existing: bool | None = None,
) -> dict[str, int]:
    """
    Insert veto rows parsed from the three language HTML tables.
    Does not delete or modify existing unrelated collections.
    """
    merged_rows = parse_veto_html_files(en_path, fr_path, es_path)
    return _import_merged_veto_rows(
        collection,
        merged_rows,
        listing_id=listing_id,
        dry_run=dry_run,
        on_conflict=_normalize_on_conflict(on_conflict, skip_existing),
    )


def import_veto_records_from_html_contents(
    collection,
    *,
    en_content: str,
    fr_content: str,
    es_content: str,
    listing_id: str = "sc_veto_list",
    dry_run: bool = False,
    on_conflict: str = "skip",
    skip_existing: bool | None = None,
) -> dict[str, int]:
    """Insert veto rows parsed from uploaded EN/FR/ES HTML table strings."""
    merged_rows = parse_veto_html_strings(en_content, fr_content, es_content)
    return _import_merged_veto_rows(
        collection,
        merged_rows,
        listing_id=listing_id,
        dry_run=dry_run,
        on_conflict=_normalize_on_conflict(on_conflict, skip_existing),
    )


def _normalize_on_conflict(on_conflict: str, skip_existing: bool | None) -> str:
    mode = (on_conflict or "skip").strip().lower()
    if mode in VETO_IMPORT_ON_CONFLICT:
        return mode
    if skip_existing is False:
        return "duplicate"
    return "skip"


def _import_merged_veto_rows(
    collection,
    merged_rows: list[dict[str, list[str]]],
    *,
    listing_id: str,
    dry_run: bool,
    on_conflict: str,
) -> dict[str, int]:
    if on_conflict not in VETO_IMPORT_ON_CONFLICT:
        on_conflict = "skip"

    stats = {
        "parsed": len(merged_rows),
        "inserted": 0,
        "updated": 0,
        "skipped": 0,
        "errors": 0,
    }

    for cells_by_lang in merged_rows:
        try:
            doc = build_veto_document_from_row(cells_by_lang, listing_id=listing_id)
            veto_id = doc.get("Veto_id") or ""
            existing = collection.find_one({"Veto_id": veto_id, "listing_id": listing_id})

            if existing:
                if on_conflict == "skip":
                    stats["skipped"] += 1
                    continue
                if on_conflict == "update":
                    if not dry_run:
                        collection.update_one(
                            {"_id": existing["_id"]},
                            {"$set": doc, "$unset": veto_legacy_html_field_unset()},
                        )
                    stats["updated"] += 1
                    continue
                if not dry_run:
                    collection.insert_one(doc)
                stats["inserted"] += 1
                continue

            if not dry_run:
                collection.insert_one(doc)
            stats["inserted"] += 1
        except Exception:
            stats["errors"] += 1

    return stats
