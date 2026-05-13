.PHONY: up down build logs ps clean restart

# Start semua services
up:
	docker compose up -d

# Start dengan rebuild
build:
	docker compose up --build -d

# Stop & remove containers
down:
	docker compose down

# Stop, remove, DAN hapus volumes (⚠️ data hilang!)
clean:
	docker compose down -v
	docker system prune -f

# Restart semua
restart:
	docker compose restart

# Lihat logs (semua services)
logs:
	docker compose logs -f

# Lihat status
ps:
	docker compose ps
	
# Linter (jalankan linter untuk cek kerapian kode backend)
lint:
	@echo "Menjalankan linter..."
	docker compose exec backend flake8 .

# Test (placeholder untuk unit test)
test:
	@echo "Menjalankan unit test..."
	docker compose exec backend pytest

# PR Check (simulasi CI lokal: build ulang lalu test)
pr-check: lint test
	@echo "✅ PR Check selesai! Kode siap untuk dibuatkan Pull Request."