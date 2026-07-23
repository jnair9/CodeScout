from google import genai
import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

BEHAVIORAL_TEMPLATE = """\
### Mode Detection
Classify silently before every task:

**Mode A — Lookup** (`how does X work?`, `where is Y defined?`, `what does Z do?`)
→ Check § CODEBASE CONTEXT below first. If the answer is there, respond directly. No file reads.

**Mode B — Precise Edit** (`fix this`, `rename`, `add a line`, `change this value`)
→ Locate exact lines with a targeted read. Apply a chunk replacement. Done.

**Mode C — Feature / Refactor** (new functionality, multi-file changes, architectural work)
→ Research silently using § CODEBASE CONTEXT + targeted reads only.
→ Write `implementation_plan.md` with [NEW] / [MODIFY] / [DELETE] per file.
→ STOP — wait for approval before writing any code.
→ Execute via `task.md` checklist, marking items done as you go.

### Tool Hierarchy
0. **§ CODEBASE CONTEXT below** — zero cost, already loaded, check here first
1. Targeted read / grep — cheapest file access, use when context isn't enough
2. Chunk replacement — surgical edit, never rewrite a full file
3. Write new file — only for genuinely new files
4. Terminal — only for: running tests, starting servers, installing packages. Never for reading or editing files.

### Hard Rules
- No preamble. First word = action.
- No post-task summary unless explicitly asked.
- Never rewrite a full file when a chunk edit works.
- Never speculatively read a file — check § CODEBASE CONTEXT first.
- Mode C: zero code before the plan is approved.\
"""


class KeyFile(BaseModel):
    file_path: str
    responsibility: str

class CodebaseContext(BaseModel):
    purpose: str
    architecture: str
    key_files: list[KeyFile]
    conventions: str
    entry_points: str
    gotchas: str


def generate_skill_file(chunks, repo_url: str) -> dict:
    chunk_summaries = "\n\n".join(
        f"[{c.symbol_type}] {c.file_path}::{c.symbol_name}\n{c.content[:250]}"
        for c in chunks[:150]
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{
            "role": "user",
            "parts": [{"text": (
                f"Analyze these code chunks from {repo_url} and return structured codebase context.\n\n"
                f"{chunk_summaries}"
            )}],
        }],
        config={
            "response_mime_type": "application/json",
            "response_schema": CodebaseContext,
        },
    )

    ctx = json.loads(response.text)
    markdown = _assemble_markdown(ctx, repo_url)

    token_response = client.models.count_tokens(
        model="gemini-2.5-flash",
        contents=markdown,
    )
    skill_tokens = token_response.total_tokens
    raw_tokens = sum(len(c.content) for c in chunks) // 4

    return {
        "markdown": markdown,
        "skill_file_tokens": skill_tokens,
        "estimated_codebase_tokens": raw_tokens,
        "reduction_pct": round((1 - skill_tokens / max(raw_tokens, 1)) * 100, 1),
        "chunks_processed": len(chunks),
    }


def _assemble_markdown(ctx: dict, repo_url: str) -> str:
    key_files_md = "\n".join(
        f"- `{kf['file_path']}` — {kf['responsibility']}"
        for kf in ctx.get("key_files", [])
    )

    return f"""# CLAUDE.md

## § BEHAVIORAL PROTOCOL

{BEHAVIORAL_TEMPLATE}

---

## § CODEBASE CONTEXT

### Purpose
{ctx['purpose']}

### Architecture
{ctx['architecture']}

### Key Files
{key_files_md}

### Conventions
{ctx['conventions']}

### Entry Points
{ctx['entry_points']}

### Gotchas
{ctx['gotchas']}
"""
