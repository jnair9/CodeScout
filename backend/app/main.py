from fastapi import FastAPI
from .models.schema import IngestRequest
from .api.ingest import run_ingestion


app = FastAPI()


@app.post("/ingest/")
async def trigger_ingestion(request: IngestRequest):
    ingested_chunks = run_ingestion(str(request.repo_url))
    return {
        "message": "Ingestion started for repo.",
        "url" : str(request.repo_url),
        "num chunks ingested" : len(ingested_chunks)
    }