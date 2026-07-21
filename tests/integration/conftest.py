import os
import subprocess
import time
import pytest
from fastapi.testclient import TestClient

def _ensure_test_db():
    result = subprocess.run(
        ["docker", "inspect", "-f", "{{.State.Running}}", "codescout-test-postgres"],
        capture_output=True, text=True
    )
    if result.stdout.strip() == "true":
        return
    if result.returncode == 0:
        subprocess.run(["docker", "start", "codescout-test-postgres"], check=True)
    else:
        subprocess.run([
            "docker", "run", "--name", "codescout-test-postgres",
            "-e", "POSTGRES_USER=codescout",
            "-e", "POSTGRES_PASSWORD=codescout",
            "-e", "POSTGRES_DB=codescout_test",
            "-p", "5433:5432",
            "-d", "pgvector/pgvector:pg16"
        ], check=True)
    time.sleep(3)

_ensure_test_db()
os.environ["DATABASE_URL"] = "postgresql://codescout:codescout@localhost:5433/codescout_test"

from backend.app.main import app
from backend.app.db.database import engine
from sqlmodel import SQLModel, Session, text

TEST_REPO = f"file://{os.path.abspath('.')}"
TEST_QUERY = "How does the repo get ingested?"

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    SQLModel.metadata.create_all(engine)
    yield
    with Session(engine) as session:
        session.exec(text("TRUNCATE TABLE code_chunks;"))
        session.exec(text("TRUNCATE TABLE repo;"))
        session.commit()

@pytest.fixture
def clean_db():
    with Session(engine) as session:
        session.exec(text("TRUNCATE TABLE code_chunks;"))
        session.exec(text("TRUNCATE TABLE repo;"))
        session.commit()
    yield

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(scope="session")
def ingested_client(client):
    with Session(engine) as session:
        session.exec(text("TRUNCATE TABLE code_chunks;"))
        session.exec(text("TRUNCATE TABLE repo;"))
        session.commit()
    # Wait for the Gemini embedding rate-limit window to reset after test_ingestion
    time.sleep(65)
    client.post("/ingest/", json={"repo_url": TEST_REPO})
    return client

@pytest.fixture(scope="session")
def query_response(ingested_client):
    return ingested_client.post("/query/", json={"query": TEST_QUERY, "repo_url": TEST_REPO})
