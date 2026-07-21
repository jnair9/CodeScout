from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import text
from typing import Annotated
import os
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ["DATABASE_URL"]
engine = create_engine(db_url)

def create_db_and_tables():
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]


