build:
	docker build -t postgres:12.7 .
compose:
	docker-compose up --build --remove-orphans -d
stop:
	docker-compose stop
start:
	docker-compose start
clear:
	make stop
	docker-compose rm -f && docker volume prune -f
prune:
	docker system prune -af
logs:
	docker-compose logs -f --tail 20
restart-db:
	docker restart bhpostgres/ && docker logs -f bhpostgres/ --tail $(line)
