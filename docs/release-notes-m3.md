# Release Notes — Milestone 3 (Final)

## Version: 3.0.0
**Release Date:** 18 Juni 2026 (Prediksi Jadwal UAS)
**Tag:** v3.0.0

## 🆕 Fitur Baru (dari Milestone 2)

### Microservices Architecture
- Monolith decomposed menjadi **Auth Service** + **Item Service**.
- Database per service terpisah (`auth_db` dan `item_db`).
- **API Gateway (Nginx)** digunakan sebagai *single entry point* dan *reverse proxy*.
- Inter-service communication dilakukan via protokol HTTP REST secara aman.

### Reliability
- Implementasi **Retry logic** dengan *exponential backoff* (max 3 retries).
- Implementasi **Circuit Breaker pattern** (membuka sirkuit setelah 5 kegagalan, 30 detik *cooldown*).
- Fitur **Graceful Degradation** diaktifkan ketika Auth Service tidak responsif, sehingga Item Service tetap dapat menyajikan data minimal.

### Monitoring & Observability
- **Structured JSON logging** terpasang dengan *correlation ID* (`X-Correlation-ID`) untuk melacak *request* lintas layanan.
- **In-memory metrics** diaktifkan (request count, error rate, latency percentiles).
- **Health dashboard** (`/status`) ter-deploy dengan kapabilitas *auto-refresh* dan indikator agregat.

### Security Hardening
- Implementasi **Rate Limiting** via Nginx Gateway (5 req/s untuk Auth, 20 req/s untuk CRUD API).
- Penguatan validasi input (`Pydantic`) pada pembuatan password, harga barang (tidak negatif), dan batasan karakter.
- **Secret audit** terselesaikan: seluruh variabel *credentials* dipindahkan ke file *environment* khusus.

## 📊 Statistik Proyek Akhir

| Metric | Nilai |
|--------|-------|
| Total Services | 6 (2 APIs, 2 DBs, Frontend, Nginx Gateway) |
| Total Endpoints | 13 |
| Integration Tests | 8 tests |
| Production URL | [TBD - Railway URL] |

## 👥 Kontribusi Tim
- **Adam Ibnu Ramadhan** - Lead Backend (Auth & Item Service, Graceful Degradation)
- **Alfian Fadillah Putra** - Lead Frontend (React UI, Dashboard)
- **Varrel Kaleb Ropard Pasaribu** - Lead DevOps (Docker, Nginx Gateway, Railway deploy)
- **Adonia Azarya Tamalonggehe** - Lead QA & Docs (Observability Testing, Documentation, Assurance)
