from google import genai
import os
from dotenv import load_dotenv
load_dotenv() 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

def embedder(content):
    result = client.models.embed_content(
            model="gemini-embedding-2",
            contents=content
    )
    return result.embeddings[0].values