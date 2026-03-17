# tests/conftest.py
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from main import app
import pytest
from fastapi.testclient import TestClient
from main import app

# fake in-memory database
class FakeUserCollection:
    def __init__(self):
        self.users = []

    async def find_one(self, query):
        for user in self.users:
            if user["email"] == query.get("email"):
                return user
        return None

    async def insert_one(self, data):
        self.users.append(data)
        return {"inserted_id": "fake_id"}

class FakeDB:
    def __init__(self):
        self.user = FakeUserCollection()

@pytest.fixture
def client(monkeypatch):
    fake_db = FakeDB()

    # override db di auth_service
    import services.auth_service as auth_service
    monkeypatch.setattr(auth_service, "db", fake_db)

    return TestClient(app)