from sqlmodel import SQLModel, Field
from typing import Optional
import uuid


class CodeChunkDB(SQLModel, table=True):

    __tablename__ = "code_chunks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    repo_url: str
    file_path: str
    parent_class: Optional[str] = None
    symbol_name: str
    symbol_type: str
    content: str
    start_line: int
    end_line: int
    language: str
