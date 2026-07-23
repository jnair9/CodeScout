from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, AnyUrl
import uuid

class CodeChunk(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    repo_url: AnyUrl
    file_path: str
    parent_class: Optional[str] = None
    symbol_name: str
    symbol_type: str
    content: str
    start_line: int
    end_line: int
    language: str

class IngestRequest(BaseModel):
    repo_url: AnyUrl

class HistoryMessage(BaseModel):
    role: str
    content: str

class QueryRequest(BaseModel):
    query: str
    repo_url: AnyUrl
    history: list[HistoryMessage] = []

class Citation(BaseModel) :
    citation_number: int
    symbol_name: str
    file_path: str
    start_line: int
    end_line: int

class Response(BaseModel):
    answer: str
    citations: list[Citation]

class SkillFileRequest(BaseModel):
    repo_url: AnyUrl

class SkillFileResponse(BaseModel):
    markdown: str
    skill_file_tokens: int
    estimated_codebase_tokens: int
    reduction_pct: float
    chunks_processed: int

class BenchmarkRequest(BaseModel):
    repo_url: AnyUrl
    task: str
    skill_file_markdown: str