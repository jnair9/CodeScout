from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from pgvector.sqlalchemy import Vector
from typing import Optional, List
import uuid
import datetime


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
    embedding: Optional[List[float]] = Field(default=None, sa_column=Column(Vector(3072)))


class Repo(SQLModel, table=True):
    repo_url: str = Field(primary_key=True)
    last_commit_hash: Optional[str] = None
    last_ingested_at: Optional[datetime.datetime] = None
