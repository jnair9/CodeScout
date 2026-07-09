db-start:
	docker run --name codescout-postgres \
			-e POSTGRES_USER=codescout \
			-e POSTGRES_PASSWORD=codescout \
			-e POSTGRES_DB=codescout \
			-p 5432:5432 \
			-d postgres:16

db-stop:
	docker stop codescout-postgres

db-rm:
	docker rm codescout-postgres

db-restart:
	docker start codescout-postgres

test-db-start:
	docker run --name codescout-test-postgres \
			-e POSTGRES_USER=codescout \
			-e POSTGRES_PASSWORD=codescout \
			-e POSTGRES_DB=codescout_test \
			-p 5433:5432 \
			-d postgres:16

test-db-stop:
	docker stop codescout-test-postgres

test-db-rm:
	docker stop codescout-test-postgres && docker rm codescout-test-postgres

db-clear:
	docker exec codescout-postgres psql -U codescout -d codescout -c "TRUNCATE TABLE code_chunks; TRUNCATE TABLE repo;"
	rm -rf chroma_db

test:
	pytest tests/integration/ -v