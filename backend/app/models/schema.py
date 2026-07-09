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

class QueryRequest(BaseModel):
    query: str
    repo_url: AnyUrl

class Citation(BaseModel) :
    citation_number: int
    symbol_name: str
    file_path: str
    start_line: int
    end_line: int

class Response(BaseModel):
    answer: str
    citations: list[Citation]