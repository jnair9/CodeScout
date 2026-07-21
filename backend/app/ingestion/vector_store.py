from sqlmodel import Session
from sqlalchemy import text
from ..models.db import CodeChunkDB
import uuid


def store(session: Session, chunks, embeddings):
    for chunk, embedding in zip(chunks, embeddings):
        db_chunk = session.get(CodeChunkDB, chunk.id)
        if db_chunk:
            db_chunk.embedding = list(embedding)
            session.add(db_chunk)
    session.commit()


def retrieve(session: Session, query_embedding: list, repo_url: str):
    embedding_str = '[' + ','.join(str(float(x)) for x in query_embedding) + ']'
    result = session.execute(
        text("""
            SELECT id, embedding <-> CAST(:emb AS vector) AS distance
            FROM code_chunks
            WHERE repo_url = :repo_url
            AND embedding IS NOT NULL
            ORDER BY distance
            LIMIT 5
        """),
        {"emb": embedding_str, "repo_url": repo_url}
    )
    rows = result.fetchall()
    return [(uuid.UUID(str(row[0])), float(row[1])) for row in rows]
