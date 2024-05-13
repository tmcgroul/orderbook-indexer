process:
	@npx node -r dotenv/config lib/processor.js


migrate:
	@npx squid-typeorm-migration apply


migration:
	@npx squid-typeorm-migration generate


codegen:
	@npx squid-typeorm-codegen


up:
	@docker-compose -f docker-compose.processor.yml up -d


down:
	@docker-compose -f docker-compose.processor.yml down -v


.PHONY: process start codegen migration migrate up down
