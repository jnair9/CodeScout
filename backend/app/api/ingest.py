import tempfile
from pathlib import Path
from git import Repo as GitRepo
from ..ingestion.parser import parse_file
from sqlmodel import select, col
from ..models.db import Repo, CodeChunkDB


def run_ingestion(ingestion_repo, session):
    chunks = []
    with tempfile.TemporaryDirectory() as tmpdirname:
        print(f"Created temporary directory: {tmpdirname}")
        temp_path = Path(tmpdirname)
        repo = GitRepo.clone_from(ingestion_repo, temp_path)
        curr_commit = repo.head.commit.hexsha
        curr_commit_time = repo.head.commit.committed_datetime
        repo_exists = session.exec(select(Repo).where(Repo.repo_url == ingestion_repo)).first()
        if not repo_exists:
            for file in temp_path.rglob("*.py"):
                if file.is_file():
                    chunk = parse_file(str(file.relative_to(temp_path)), "python", ingestion_repo)
                    chunks.extend(chunk)
            new_repo = Repo(repo_url=ingestion_repo, last_commit_hash=curr_commit, last_ingested_at=curr_commit_time)
            session.add(new_repo)
        else:
            prev_commit = repo_exists.last_commit_hash
            changed_files = repo.git.diff(prev_commit, curr_commit, name_status=True).split("\n")
            for entry in changed_files:
                if not entry:
                    continue
                status, file = entry.split('\t')
                if status != "D" and file.endswith(".py"):
                    if status == "M":
                        old_files = session.exec(select(CodeChunkDB).where((CodeChunkDB.file_path == file))).all()
                        for del_file in old_files:
                            session.delete(del_file)
                    chunk = parse_file(file, "python", ingestion_repo)
                    chunks.extend(chunk)
            repo_exists.last_commit_hash = curr_commit
            repo_exists.last_ingested_at = curr_commit_time
        session.commit()
    return chunks

