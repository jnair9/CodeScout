from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = "gemini-2.5-flash"


def _call(prompt: str) -> dict:
    response = client.models.generate_content(
        model=MODEL,
        contents=[{"role": "user", "parts": [{"text": prompt}]}],
    )
    meta = response.usage_metadata
    return {
        "input_tokens": meta.prompt_token_count,
        "output_tokens": meta.candidates_token_count,
        "answer_preview": (response.text or "")[:300].strip(),
    }


def run_benchmark(chunks, skill_file_markdown: str, task: str) -> dict:
    raw_dump = "\n\n---\n\n".join(
        f"// {c.file_path} [{c.symbol_type}: {c.symbol_name}]\n{c.content}"
        for c in chunks[:100]
    )

    no_context   = _call(f"Answer this question about a software codebase: {task}")
    raw_codebase = _call(f"You have access to the following codebase:\n\n{raw_dump}\n\nQuestion: {task}")
    skill_file   = _call(f"{skill_file_markdown}\n\nUsing the codebase context above, answer: {task}")

    raw_input  = raw_codebase["input_tokens"]
    sf_input   = skill_file["input_tokens"]
    reduction  = round((1 - sf_input / max(raw_input, 1)) * 100, 1)

    return {
        "task": task,
        "no_context": no_context,
        "raw_codebase": raw_codebase,
        "skill_file": skill_file,
        "skill_vs_raw_input_reduction_pct": reduction,
    }
