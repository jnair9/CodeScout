from fastapi import FastAPI
from .models.schema import IngestRequest, QueyRequest
from .api.ingest import run_ingestion
from .ingestion.embedder import embedder
from .ingestion.vector_store import store, retrieve
from contextlib import asynccontextmanager
from .models.db import CodeChunkDB
from .db.database import create_db_and_tables, SessionDep
from sqlmodel import select, col

@asynccontextmanager
async def lifespan(app : FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/ingest/")
async def trigger_ingestion(request: IngestRequest, session: SessionDep):
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
        session.add(CodeChunkDB(**chunk.model_dump(mode='json')))
        session.commit()
    store(ingested_chunks, ingested_embeddings)
    return {
        "message": "Ingestion started for repo.",
        "url" : str(request.repo_url), 
        "num chunks ingested" : len(ingested_chunks)
    }
@app.post("/query/")
async def query_repo(request: QueyRequest, session: SessionDep):
    #embed the request
    embedded_content = embedder(request.query)
    #query w/ embedded request 
    retrieved_ids = retrieve(embedded_content)
    statement = select(CodeChunkDB).where(col(CodeChunkDB.id).in_(retrieved_ids))
    results = session.exec(statement).all()
    results = [chunk.model_dump(mode='json') for chunk in results]
    return {
        "message" : "Retrieved relevant files." if results else "No relevant files detected",
        "results" : results
    }
