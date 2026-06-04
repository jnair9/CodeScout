import chromadb
from pathlib import Path

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