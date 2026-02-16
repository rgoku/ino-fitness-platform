# ════════════════════════════════════════════════════════════════
# INÖ Platform — Development Commands
# ════════════════════════════════════════════════════════════════

.PHONY: up down seed migrate frontend logs reset

# Start all services
up:
	docker compose up -d
	@echo ""
	@echo "  ✅ Services running:"
	@echo "     API:    http://localhost:8000/docs"
	@echo "     MinIO:  http://localhost:9001"
	@echo ""
	@echo "  Run 'make seed' to populate demo data"

# Stop all services
down:
	docker compose down

# Run database migrations
migrate:
	docker compose exec api alembic upgrade head

# Seed demo data (coach + 8 clients + workouts + check-ins + messages)
seed:
	docker compose exec api python -m scripts.seed
	@echo ""
	@echo "  🎉 Demo ready!"
	@echo "     Login: sarah@inocoach.com / demo1234"
	@echo "     Or any client: james@mail.com / demo1234"

# Start frontend dev server
frontend:
	cd apps/coach-web && pnpm install && pnpm dev

# View API logs
logs:
	docker compose logs -f api

# Full reset: drop volumes, recreate, seed
reset:
	docker compose down -v
	docker compose up -d
	@echo "  Waiting for Postgres..."
	@sleep 5
	docker compose exec api python -m scripts.seed

# Quick start: everything from scratch
start: up
	@echo "  Waiting for Postgres..."
	@sleep 5
	$(MAKE) seed
	@echo ""
	@echo "  Run 'make frontend' in another terminal to start the UI"
