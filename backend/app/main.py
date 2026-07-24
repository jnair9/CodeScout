from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models.schema import IngestRequest, QueryRequest, SkillFileRequest, BenchmarkRequest
from .api.ingest import run_ingestion
from .ingestion.embedder import embedder
from .ingestion.vector_store import store, retrieve
from contextlib import asynccontextmanager
from .models.db import CodeChunkDB
from .db.database import create_db_and_tables, SessionDep
from sqlmodel import select, col
from .generator.generator import generator
from .generator.skillfile import generate_skill_file
from .generator.benchmark import run_benchmark
from .ingestion.bm25 import get_bm_rank
from .utils.utils import normalize_url
import json
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ingest/")
async def trigger_ingestion(request: IngestRequest, session: SessionDep):
    repo_url = normalize_url(str(request.repo_url))
    ingested_chunks = run_ingestion(repo_url, session)
    ingested_embeddings = []
    for chunk in ingested_chunks:
        if chunk.parent_class:
            content = f"title: {chunk.parent_class}.{chunk.symbol_name} | text: {chunk.content}"
        else:
            content = f"title: {chunk.symbol_name} | text: {chunk.content}"
        embedded_content = embedder(content)
        ingested_embeddings.append(embedded_content)
        session.add(CodeChunkDB(**chunk.model_dump(mode='json')))
        session.commit()
    store(session, ingested_chunks, ingested_embeddings)
    return {
        "message": "Ingestion started for repo.",
        "url": repo_url,
        "num chunks ingested": len(ingested_chunks)
    }


@app.post("/query/")
async def query_repo(request: QueryRequest, session: SessionDep):
    repo_url = normalize_url(str(request.repo_url))
    corpus = session.exec(select(CodeChunkDB).where(CodeChunkDB.repo_url == repo_url)).all()
    top_n_bm_res = get_bm_rank(request.query, corpus)
    bm_results = [chunk.model_dump(mode='json', exclude={'embedding'}) for chunk in top_n_bm_res]
    retrieval_query = request.query
    if request.history:
        recent_context = " ".join(m.content for m in request.history[-3:] if m.role == "user")
        retrieval_query = f"{recent_context} {request.query}"
    embedded_content = embedder(retrieval_query)
    retrieved_ids_dists = retrieve(session, embedded_content, repo_url)
    if not retrieved_ids_dists:
        results = []
    else:
        retrieved_ids, _ = zip(*retrieved_ids_dists)
        statement = select(CodeChunkDB).where(col(CodeChunkDB.id).in_(retrieved_ids))
        vector_results = session.exec(statement).all()
        dist_map = {str(id): dist for id, dist in retrieved_ids_dists}
        results = [chunk.model_dump(mode='json', exclude={'embedding'}) for chunk in vector_results]
        for res in results:
            res["distance"] = dist_map[res["id"]]

    vector_ids = set([res["id"] for res in results])
    for chunk in bm_results:
        if chunk["id"] not in vector_ids:
            results.append(chunk)

    generated_response = generator(request.query, results, request.history)

    return {
        "query:": request.query,
        "message": "Retrieved relevant files and response." if results and generated_response else "No relevant files or response detected.",
        "results": results,
        "response": json.loads(generated_response)
    }


@app.post("/skillfile/")
async def skill_file(request: SkillFileRequest, session: SessionDep):
    repo_url = normalize_url(str(request.repo_url))
    chunks = session.exec(select(CodeChunkDB).where(CodeChunkDB.repo_url == repo_url)).all()
    if not chunks:
        raise HTTPException(status_code=404, detail=f"No indexed chunks found for {repo_url}. Ingest the repo first.")
    try:
        return generate_skill_file(chunks, repo_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/benchmark/")
async def benchmark(request: BenchmarkRequest, session: SessionDep):
    repo_url = normalize_url(str(request.repo_url))
    chunks = session.exec(select(CodeChunkDB).where(CodeChunkDB.repo_url == repo_url)).all()
    if not chunks:
        raise HTTPException(status_code=404, detail=f"No indexed chunks found for {repo_url}. Ingest the repo first.")
    try:
        return run_benchmark(chunks, request.skill_file_markdown, request.task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
