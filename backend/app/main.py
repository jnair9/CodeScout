from fastapi import FastAPI
from .models.schema import IngestRequest, QueyRequest
from .api.ingest import run_ingestion
from .ingestion.embedder import embedder
from .ingestion.vector_store import store, retrieve
from contextlib import asynccontextmanager
from .models.db import CodeChunkDB
from .db.database import create_db_and_tables, SessionDep
from sqlmodel import select, col
from .generator.generator import generator
from .ingestion.bm25 import get_bm_rank
import json

@asynccontextmanager
async def lifespan(app : FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/ingest/")
async def trigger_ingestion(request: IngestRequest, session: SessionDep):
    ingested_chunks = run_ingestion(str(request.repo_url), session)
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
    #bm25 matches
    corpus = session.exec(select(CodeChunkDB)).all()
    top_n_bm_res = get_bm_rank(request.query, corpus)
    bm_results = [chunk.model_dump(mode='json') for chunk in top_n_bm_res]
    #embed the request
    embedded_content = embedder(request.query)
    #query w/ embedded request 
    retrieved_ids_dists = retrieve(embedded_content)
    retrieved_ids, _ = zip(*retrieved_ids_dists)
    statement = select(CodeChunkDB).where(col(CodeChunkDB.id).in_(retrieved_ids))
    vector_results = session.exec(statement).all()
    dist_map = {str(id): dist for id, dist in retrieved_ids_dists}
    results = [chunk.model_dump(mode='json') for chunk in vector_results]
    #add distances from query to returned CodeChunk
    for res in results:
        res["distance"] = dist_map[res["id"]]

    #combine result
    vector_ids = set([res["id"] for res in results])
    for chunk in bm_results:
        if chunk["id"] not in vector_ids:
            results.append(chunk)


    generated_response = generator(request.query, results)


    return {
        "query:": request.query,
        "message" : "Retrieved relevant files and response ." if results and generated_response else "No relevant files or response detected.",
        "results" : results,
        "response" : json.loads(generated_response)
    }
