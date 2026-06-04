from fastapi import FastAPI
from .models.schema import IngestRequest
from .api.ingest import run_ingestion
from .ingestion.embedder import embedder
from .ingestion.vector_store import store


app = FastAPI()


@app.post("/ingest/")
async def trigger_ingestion(request: IngestRequest):
    ingested_chunks = run_ingestion(str(request.repo_url))
    ingested_embeddings = [] 
    for chunk in ingested_chunks:
        content = None
        if chunk.parent_class:
            content = f"title: {chunk.parent_class}.{chunk.symbol_name} | text: {chunk.content}"
        else:
            content = f"title: {chunk.symbol_name} | text: {chunk.content}"
        embedded_content = embedder(content)
        ingested_embeddings.append(embedded_content)
    store(ingested_chunks, ingested_embeddings)
    return {
        "message": "Ingestion started for repo.",
        "url" : str(request.repo_url), 
        "num chunks ingested" : len(ingested_chunks)
    }