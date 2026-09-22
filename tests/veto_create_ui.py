"""
Shared helpers: same document assembly as the Veto List UI (create_veto_listing).
Used by unit tests (in-memory) and integration tests (MongoDB dl_veto_data_collection only).
"""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo.collection import Collection
from pymongo.mongo_client import MongoClient

VETO_DB_NAME = "DynamicListings"
VETO_COLLECTION_NAME = "dl_veto_data_collection"
INTEGRATION_LISTING_ID = "sc_veto_list_pytest_integration"


def load_veto_html_import_module():
    path = Path(__file__).resolve().parents[1] / "dl" / "veto_html_import.py"
    spec = importlib.util.spec_from_file_location("veto_html_import", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def veto_collection(client: MongoClient) -> Collection:
    return client[VETO_DB_NAME][VETO_COLLECTION_NAME]


def mongodb_client_for_tests() -> MongoClient:
    load_dotenv()
    uri = os.getenv("DATABASE_CONN") or os.getenv("MONGO_CS")
    if os.environ.get("DLX_REST_LOCAL"):
        import boto3

        uri = boto3.client("ssm", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")).get_parameter(
            Name="uatISSU-admin-connect-string",
            WithDecryption=True,
        )["Parameter"]["Value"]
    if not uri:
        raise RuntimeError("DATABASE_CONN (or MONGO_CS) is not configured for integration tests")
    return MongoClient(uri)


def insert_veto_like_ui_create(collection, veto_mod, form: dict) -> dict:
    """Mirror create_veto_listing: EN/FR/ES fields for selected language, then insert_one."""
    listing_id = form.get("listing_id") or veto_mod.VETO_DEFAULT_LISTING_ID
    language_selected = form.get("languageSelected")
    lang_suffix = {"EN": "en", "FR": "fr", "ES": "es"}.get(language_selected)
    if not lang_suffix:
        raise ValueError("Unsupported languageSelected")

    dataset = veto_mod.empty_veto_document()
    dataset["listing_id"] = listing_id
    for name in veto_mod.veto_per_lang_field_names():
        if name.endswith(f"_{lang_suffix}"):
            dataset[name] = form.get(name) or ""

    veto_id = (form.get("Veto_id") or "").strip()
    if not veto_id:
        raise ValueError("Record id (Veto_id) is required")
    dataset["Veto_id"] = veto_id
    dataset["sort_date"] = (form.get("sort_date") or "").strip()

    if collection.find_one({"Veto_id": veto_id, "listing_id": listing_id}):
        raise ValueError(f"Record already exists for {veto_id}")

    collection.insert_one(dataset)
    return dataset
