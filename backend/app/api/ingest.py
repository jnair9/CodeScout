import tempfile
from pathlib import Path
from git import Repo
from ..ingestion.parser import parse_file


def run_ingestion(ingestion_repo):
    chunks = []
    with tempfile.TemporaryDirectory() as tmpdirname:
        print(f"Created temporary directory: {tmpdirname}")
        temp_path = Path(tmpdirname)
        repo = Repo.clone_from(ingestion_repo, temp_path)

        for file in temp_path.rglob("*.py"):
            if file.is_file():
                chunk = parse_file(str(file), "python", ingestion_repo)
                chunks.extend(chunk)
    return chunks

