import chromadb
from pathlib import Path
import uuid

DB_PATH = Path(__file__).parent.parent.parent.parent / "chroma_db"
client = chromadb.PersistentClient(path=str(DB_PATH))
collection = client.get_or_create_collection(name="CodeScout")



def store(chunks, embeddings):
    for chunk, embedding in zip(chunks, embeddings):
        collection.add(
        ids=[str(chunk.id)],
        embeddings=[
            embedding
        ],
        metadatas=[
            {"repo_url": str(chunk.repo_url)},
        ]
)

def retrieve(query, repo_url):
    results = collection.query(
        query_embeddings=[query],
        n_results=5,
        include=["distances"],
        where={"repo_url": str(repo_url)}
        )
    ids = [uuid.UUID(item) for item in results["ids"][0]]
    distances = results["distances"][0]
    return list(zip(ids, distances))