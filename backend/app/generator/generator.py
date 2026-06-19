from google import genai
import os
from dotenv import load_dotenv
from ..models.schema import Citation, Response

load_dotenv() 
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

def generator(request, results):
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            f"Answer the {request}, using only these results: {results}. "
            f"Embed inline citation markers [1], [2], etc. in the answer where you reference a source. "
            f"Each citation must have citation_number matching its marker, "
            f"symbol_name is the function or class name, "
            f"file_path is the file it came from, "
            f"start_line and end_line are the line numbers. "
            f"Populate the citations list with each source you referenced."
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": Response,
        },
    )
    return response.text