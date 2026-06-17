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