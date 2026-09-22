"""
Integration test: one insert into dl_veto_data_collection using UI create logic.

Requires Mongo (DATABASE_CONN or DLX_REST_LOCAL + AWS SSM). Only reads/writes the veto
collection; removes the test document in teardown.

  DLX_REST_LOCAL=True ./venv/bin/python -m pytest tests/test_veto_integration.py -v -m integration
"""

from __future__ import annotations

import uuid

import pytest

from tests.veto_create_ui import (
    INTEGRATION_LISTING_ID,
    insert_veto_like_ui_create,
    load_veto_html_import_module,
    mongodb_client_for_tests,
    veto_collection,
)

pytestmark = pytest.mark.integration


def test_ui_create_inserts_one_record_in_veto_collection_only():
    veto_mod = load_veto_html_import_module()
    client = mongodb_client_for_tests()
    collection = veto_collection(client)

    veto_id = f"S/TEST/PY-{uuid.uuid4().hex[:12].upper()}"
    listing_id = INTEGRATION_LISTING_ID
    query = {"Veto_id": veto_id, "listing_id": listing_id}

    form = {
        "listing_id": listing_id,
        "languageSelected": "EN",
        "Veto_id": veto_id,
        "sort_date": "2099-01-01",
        "date_en": "1 January 2099",
        "draft_prefix_en": "",
        "draft_en": veto_id,
        "draft_sufix_en": "",
        "draft_link_en": f"https://undocs.org/en/{veto_id}",
        "written_record_prefix_en": "",
        "written_record_en": "",
        "written_record_sufix_en": "",
        "written_record_link_en": "",
        "agenda_item_prefix_en": "",
        "agenda_item_en": "Integration test agenda",
        "agenda_item_sufix_en": "",
        "agenda_item_link_en": "",
        "negative_vote_en": "Test Permanent Member",
    }

    assert collection.find_one(query) is None

    try:
        inserted = insert_veto_like_ui_create(collection, veto_mod, form)
        stored = collection.find_one(query)
        assert stored is not None
        assert stored["Veto_id"] == veto_id
        assert stored["listing_id"] == listing_id
        assert stored["draft_link_en"] == form["draft_link_en"]
        assert stored["sort_date"] == inserted["sort_date"]
        assert collection.count_documents(query) == 1
    finally:
        collection.delete_one(query)
        assert collection.find_one(query) is None

    client.close()
