"""Pytest setup: testing env before importing dl.routes (avoids AWS SSM on import)."""

import os
import sys

_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

for _key in list(os.environ):
    if _key.startswith("DLX_REST_"):
        del os.environ[_key]

os.environ["DLX_REST_TESTING"] = "True"
os.environ.setdefault("DATABASE_CONN", "mongodb://127.0.0.1:27017")
