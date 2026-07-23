import tempfile
from pathlib import Path
from git import Repo as GitRepo
from ..ingestion.parser import parse_file
from sqlmodel import select, col
from ..models.db import Repo, CodeChunkDB

EXT_TO_LANG = {
    '.py':   'python',
    '.java': 'java',
    '.js':   'javascript',
    '.mjs':  'javascript',
    '.cjs':  'javascript',
    '.ts':   'typescript',
    '.tsx':  'tsx',
    '.go':   'go',
    '.rs':   'rust',
    '.rb':   'ruby',
    '.kt':   'kotlin',
    '.kts':  'kotlin',
}

# Directories that are never worth indexing
SKIP_DIRS = {
    '.git', 'node_modules', 'dist', 'build', '.next', 'out',
    'vendor', '__pycache__', '.tox', 'venv', '.venv', 'coverage',
}

def _supported_files(root: Path):
    for file in root.rglob("*"):
        if any(part in SKIP_DIRS for part in file.parts):
            continue
        if file.is_file() and file.suffix in EXT_TO_LANG:
            yield file

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
            for file in _supported_files(temp_path):
                lang = EXT_TO_LANG[file.suffix]
                chunk = parse_file(str(file), lang, ingestion_repo, stored_path=str(file.relative_to(temp_path)))
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
                if status != "D" and Path(file).suffix in EXT_TO_LANG:
                    lang = EXT_TO_LANG[Path(file).suffix]
                    if status == "M":
                        old_files = session.exec(select(CodeChunkDB).where((CodeChunkDB.file_path == file))).all()
                        for del_file in old_files:
                            session.delete(del_file)
                    chunk = parse_file(str(temp_path / file), lang, ingestion_repo, stored_path=file)
                    chunks.extend(chunk)
            repo_exists.last_commit_hash = curr_commit
            repo_exists.last_ingested_at = curr_commit_time
        session.commit()
    return chunks
