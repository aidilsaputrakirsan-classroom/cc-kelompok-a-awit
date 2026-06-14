# Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di file ini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan proyek ini mengikuti [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Integration test CI job dengan Docker Compose
- Log artifacts disimpan sebagai GitHub Actions artifacts
- Deployment summary otomatis di CD workflow

---

## [3.0.0] - 2026-06-14

### Added
- Arsitektur Microservices: Auth Service (port 8001) + Item Service (port 8002)
- API Gateway berbasis Nginx untuk routing terpusat
- Database per service: `auth_db` dan `item_db` (PostgreSQL)
- Structured JSON logging dengan correlation ID di semua services
- Metrics endpoint (`/metrics`) di setiap service
- Circuit breaker pattern di Item Service untuk toleransi Auth Service down
- Health check endpoint di semua services
- Docker Compose dengan resource limits (CPU + memory hardening)
- `docker-compose.prod.yml` untuk production overrides
- Integration tests (`tests/integration/`) untuk cross-service testing
- Logging middleware dan metrics di Auth Service & Item Service
- `services/shared/` untuk shared utilities (logging, metrics)

### Changed
- Frontend API calls disesuaikan ke gateway URL
- CI pipeline diupdate untuk multi-service build
- CD pipeline dengan health check setelah deploy

### Fixed
- CORS configuration untuk production domain
- Database connection pool settings untuk stabilitas

---

## [2.0.0] - 2026-06-03

### Added
- Login page redesign dengan tab Masuk/Daftar
- Register form dengan validasi (nama, email, password, konfirmasi)
- Vite dev proxy untuk local development (`/auth`, `/api`, `/health`)
- `database.py`: auto-fix Supabase/Heroku `DATABASE_URL` format
- `database.py`: `pool_pre_ping` dan `pool_recycle` untuk stabilitas koneksi

### Changed
- Login form menggunakan field **email** (bukan username)
- `api.js`: perbaikan URL routing agar sesuai dengan DeployCC nginx
- `nginx.conf` frontend: tambah proxy untuk `/auth/` dan `/api/`
- `docker-compose.yml`: tambah `ALLOWED_ORIGINS` untuk production domain

### Fixed
- Bug kritis: form login mengirim `username` bukan `email` → selalu 401
- Double `/api/api/` prefix pada endpoint items/vendors/blocks
- `root_path="/api"` dihapus dari FastAPI untuk mencegah path stripping ganda

### Deployment
- URL Production: https://cc-kelompok-a-awit.akhzafachrozy.my.id
- Platform: DeployCC v1.4 (systemd + uvicorn + nginx)

---

## [1.0.0] - 2026-05-20

### Added
- Full-stack aplikasi PalmChain: Palm Oil Supply Chain Monitoring
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React + Vite + React Router
- Authentication: JWT (register, login, `/auth/me`)
- Endpoints: Items, Vendors (Contractors), Blocks, Dashboard, Hauling
- Halaman: Dashboard, Master Data (Contractor, Block, Mapping), Transaksi Hauling
- Dark mode toggle dengan `localStorage` persistence
- Docker Compose setup (monolith)
- CI Pipeline: pytest (backend) + Vitest (frontend) + Docker build
- CD Pipeline: auto-deploy ke DeployCC via GitHub Actions
- Test coverage backend ≥ 50%
- Ruff linting konfigurasi (`backend/ruff.toml`)

### Tech Stack
- **Backend**: Python 3.12, FastAPI 0.115, SQLAlchemy 2.0, Uvicorn
- **Frontend**: React 19, Vite 7, React Router 7, Recharts, React-Leaflet
- **Database**: PostgreSQL 16
- **CI/CD**: GitHub Actions
- **Deployment**: DeployCC v1.4 (systemd service)

---

[Unreleased]: https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-awit/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-awit/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-awit/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-awit/releases/tag/v1.0.0
