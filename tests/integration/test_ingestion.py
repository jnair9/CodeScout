import os
TEST_REPO = f"file://{os.path.abspath('.')}"

def test_ingestion(client, clean_db):
    response = client.post("/ingest/", json={"repo_url": TEST_REPO})
    data = response.json()

    assert response.status_code == 200
    assert "message" in data
    assert "url" in data
    assert "num chunks ingested" in data
    assert data["num chunks ingested"] > 0
    assert TEST_REPO in data["url"]
