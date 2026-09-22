"""Unit tests for inserting records into dl_veto_data_collection (in-memory)."""

from __future__ import annotations

from unittest.mock import MagicMock

from tests.veto_create_ui import insert_veto_like_ui_create, load_veto_html_import_module


class InMemoryVetoCollection:
    """Minimal Mongo collection stand-in for veto insert/find tests."""

    def __init__(self) -> None:
        self.records: list[dict] = []

    def find_one(self, query: dict) -> dict | None:
        for doc in self.records:
            if doc.get("Veto_id") == query.get("Veto_id") and doc.get("listing_id") == query.get(
                "listing_id"
            ):
                return doc
        return None

    def insert_one(self, doc: dict) -> MagicMock:
        self.records.append(dict(doc))
        return MagicMock(inserted_id="507f1f77bcf86cd799439011")


def _sample_veto_document(veto_mod, *, listing_id: str, veto_id: str) -> dict:
    doc = veto_mod.empty_veto_document()
    doc.update(
        {
            "Veto_id": veto_id,
            "sort_date": "2099-12-31",
            "listing_id": listing_id,
            "date_en": "31 December 2099",
            "draft_prefix_en": "",
            "draft_en": veto_id,
            "draft_sufix_en": "",
            "draft_link_en": f"https://undocs.org/en/{veto_id}",
            "negative_vote_en": "Test Permanent Member",
        }
    )
    return doc


def test_add_one_veto_record_to_in_memory_collection():
    """Build a schema-valid document and insert one row (create_veto_listing shape)."""
    veto_mod = load_veto_html_import_module()
    collection = InMemoryVetoCollection()
    listing_id = "sc_veto_list_pytest"
    veto_id = "S/TEST/999999"

    doc = _sample_veto_document(veto_mod, listing_id=listing_id, veto_id=veto_id)
    assert collection.find_one({"Veto_id": veto_id, "listing_id": listing_id}) is None

    collection.insert_one(doc)

    assert len(collection.records) == 1
    stored = collection.find_one({"Veto_id": veto_id, "listing_id": listing_id})
    assert stored is not None
    assert stored["draft_link_en"] == doc["draft_link_en"]
    assert stored["sort_date"] == "2099-12-31"
    for field_name in veto_mod.veto_per_lang_field_names():
        assert field_name in stored


def test_create_veto_listing_logic_inserts_one_record():
    """Mirrors create_veto_listing: one new Veto_id is inserted into the collection."""
    veto_mod = load_veto_html_import_module()
    collection = InMemoryVetoCollection()
    listing_id = "sc_veto_list_pytest"
    veto_id = "S/TEST/CREATE-001"

    form = {
        "listing_id": listing_id,
        "languageSelected": "EN",
        "Veto_id": veto_id,
        "sort_date": "2099-06-15",
        "date_en": "15 June 2099",
        "draft_en": veto_id,
        "draft_link_en": f"https://undocs.org/en/{veto_id}",
        "negative_vote_en": "United States",
    }

    inserted = insert_veto_like_ui_create(collection, veto_mod, form)

    assert len(collection.records) == 1
    assert inserted["Veto_id"] == veto_id
    assert collection.find_one({"Veto_id": veto_id, "listing_id": listing_id}) is not None
