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
        ]
)

def retrieve(query):
    results = collection.query(
        query_embeddings=[query],
        n_results=5,
        )
    return [uuid.UUID(item) for item in results["ids"][0]]