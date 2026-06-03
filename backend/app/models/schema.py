from typing import Optional
from pydantic import BaseModel, Field, HttpUrl
import uuid
import datetime

class CodeChunk(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    repo_url: HttpUrl
    file_path: str
    parent_class: Optional[str] = None
    symbol_name: str
    symbol_type: str
    content: str
    start_line: int
    end_line: int
    language: str

class Repo(BaseModel):
    repo_url : HttpUrl
    last_commit_hash: Optional[str] = None
    last_ingested_at : Optional[datetime.datetime] = None

class IngestRequest(BaseModel):
    repo_url: HttpUrl