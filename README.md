# CodeScout

**Live:** [codescoutapp.netlify.app](https://codescoutapp.netlify.app/)

CodeScout is an AI-powered developer onboarding platform. Give it a GitHub repo URL, and you can ask natural language questions and get answers grounded in exact files and line numbers. It also generates a `CLAUDE.md` skill file — a compressed, repo-specific context file that makes AI coding assistants significantly more token-efficient when working in that codebase.

---

## What it does

**Codebase ingestion** — CodeScout clones a GitHub repo and parses it using tree-sitter into semantically meaningful chunks: functions, classes, and methods — not naive line splits. It supports 8 languages: Python, Java, JavaScript, TypeScript, Go, Rust, Ruby, and Kotlin. Ingestion is incremental: it tracks the HEAD commit hash and only re-parses files that changed, so re-ingesting a repo is fast.

**Hybrid retrieval** — When you ask a question, CodeScout runs two retrieval passes: BM25 (keyword matching) and vector similarity search (via pgvector + Gemini embeddings at 3072 dims). Results are merged, deduped, and passed to Gemini as grounded context. Every answer cites the exact file path, symbol name, and line range it drew from.

**Multi-turn chat** — Conversation history is maintained across follow-up questions. The last 3 user turns are prepended to the retrieval query so context-dependent questions find the right chunks.

**CLAUDE.md generation** — CodeScout synthesizes a skill file from the indexed chunks using Gemini's structured output. The file combines a fixed behavioral protocol (mode detection, tool hierarchy, hard rules) with a RAG-generated codebase context section (purpose, architecture, key files, conventions, entry points, gotchas). The result: Claude Code arrives at any task in that repo already knowing the codebase, without reading files speculatively.

**Efficiency benchmark** — A built-in benchmark runs the same task three ways against Gemini — no context, raw codebase dump, skill file — and compares real token counts from `usage_metadata`. Visualized with an animated token chart. The skill file consistently shows 70–85% fewer input tokens than a raw dump.

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Lucide icons |
| Backend | FastAPI, Python, SQLModel, Pydantic |
| AI / Embeddings | Google Gemini API (`gemini-2.5-flash`, `gemini-embedding-2`) |
| Retrieval | pgvector (vector similarity), rank-bm25 (keyword), hybrid merge |
| Database | PostgreSQL via Supabase |
| Parsing | tree-sitter (8 language grammars) |
| Infra | Google Cloud Run (backend), Netlify (frontend), Docker |
| Other | GitPython, python-dotenv, psycopg2-binary |

---

## What makes it not a chatbot wrapper

- **Semantic parsing** — chunks are symbols (functions/classes), not arbitrary text windows
- **Hybrid retrieval** — BM25 + vector search catches things each misses alone
- **Grounded citations** — every answer cites exact file + line range, verifiable
- **Incremental indexing** — diff-based re-ingestion, not a full re-clone every time
- **Skill file synthesis** — repo-aware CLAUDE.md generated from live index, not a generic template
- **Measured efficiency** — real token counts benchmarked, not a claim

---

## Running locally

**Backend**
```bash
pip install uv
uv pip install --system .
uvicorn backend.app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8000` in `frontend/.env.local` to point the frontend at the local backend.
