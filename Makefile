.PHONY: up down build logs ps clean restart lint test pr-check

# Start semua services (Menggunakan mode detached)
up:
	docker compose up -d

# Start dengan rebuild total (Sangat berguna saat ada perubahan kode)
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

# Lihat status kesehatan kontainer (Memantau indikator healthy)
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