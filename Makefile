.DEFAULT_GOAL := help
.PHONY: help up start down restart logs ps reset

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  make %-10s %s\n", $$1, $$2}'

.env: ## (auto) create .env from .env.example if missing
	@cp .env.example .env
	@echo "Created .env from .env.example"

up: .env ## Build and start everything (frontend + backend + postgres)
	docker compose up --build

start: .env ## Same as up, but in the background
	docker compose up --build -d
	@echo "App is starting. Use 'make logs' to follow the output."

down: ## Stop all containers
	docker compose down

restart: ## Restart all containers
	docker compose restart

logs: ## Follow logs of all services
	docker compose logs -f

ps: ## Show running containers
	docker compose ps

reset: ## Stop everything and delete the database volume (fresh start)
	docker compose down -v
