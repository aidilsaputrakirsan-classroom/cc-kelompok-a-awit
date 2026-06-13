.PHONY: dev prod up down build logs status ps clean restart lint test pr-check

# ── [TUGAS DEVOPS MODUL 14: ENVIRONMENT TARGETS] ──
# Start lingkungan DEVELOPMENT lokal
dev:
	docker compose up --build -d

# Start lingkungan PRODUCTION (menggabungkan file override prod)
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Lihat status kesehatan kontainer (Memantau indikator healthy)
status:
	docker compose ps

# ── [PERINTAH UTILITY REGULER] ──
# Start semua services biasa
up:
	docker compose up -d

# Start dengan rebuild total
build:
	docker compose up --build -d

# Stop & remove containers
down:
	docker compose down

# Stop, remove, DAN hapus data volume serta cache (Hard Reset)
clean:
	docker compose down -v
	docker builder prune -f

# Restart semua kontainer
restart:
	docker compose restart

# Lihat logs terintegrasi (semua services)
logs:
	docker compose logs -f

# Alias untuk melihat status
ps:
	docker compose ps
	
# Linter (Jalankan linter flake8 di dalam Auth Service)
lint:
	@echo "Menjalankan linter di auth-service..."
	docker compose exec auth-service flake8 .

# Test (Menjalankan unit test pytest di dalam Auth Service)
test:
	@echo "Menjalankan unit test di auth-service..."
	docker compose exec auth-service pytest

# PR Check (Simulasi CI lokal sebelum push ke GitHub)
pr-check: lint test
	@echo "✅ PR Check lokal selesai! Kode infrastruktur siap untuk Pull Request."