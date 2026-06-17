# 🐳 Arsitektur Multi-Container — PalmTrack Cloud

> Dokumentasi ini disusun oleh **Lead QA & Documentation** sebagai tugas Modul 6 — Docker Lanjutan.
>
> **Tujuan:** Menggambarkan arsitektur 3-container lengkap beserta ports, networks, volumes, dan environment variables yang digunakan.

---

## 1. Arsitektur Overview

Aplikasi PalmTrack Cloud berjalan dalam **3 container** yang saling terhubung melalui Docker custom network `cloudnet`.

```mermaid
flowchart TD
    subgraph DOCKER_NET["🌐 Docker Network: cloudnet"]
        subgraph FE_C["Frontend Container"]
            FE["Nginx + React Build\n(static HTML/CSS/JS)"]
            FE_PORT["Port: 80"]
        end

        subgraph BE_C["Backend Container"]
            BE["FastAPI + Uvicorn\n(REST API)"]
            BE_PORT["Port: 8000"]
            BE_HC["HEALTHCHECK\ncurl /health"]
        end

        subgraph DB_C["Database Container"]
            DB["PostgreSQL 16\n(Alpine)"]
            DB_PORT["Port: 5432"]
        end

        subgraph VOL["💾 Named Volume"]
            PGDATA["pgdata\n/var/lib/postgresql/data"]
        end

        BE -->|"postgresql://db:5432/cloudapp"| DB
        DB --- PGDATA
    end

    USER["👤 Browser User"] -->|"localhost:3000 → :80"| FE
    USER -->|"localhost:8000 → :8000"| BE
    ADMIN["👨‍💻 Admin/Dev"] -->|"localhost:5433 → :5432"| DB

    style DOCKER_NET fill:#DEEBF7,stroke:#2E75B6
    style FE_C fill:#E2D9F3,stroke:#7B68A5
    style BE_C fill:#FCE4D6,stroke:#BF8F00
    style DB_C fill:#E2EFDA,stroke:#548235
    style VOL fill:#FFF2CC,stroke:#BF8F00
```

---

## 2. Detail Setiap Container

### 2.1 Database Container (`db`)

```mermaid
flowchart LR
    subgraph DB_DETAIL["🗄️ Database Container: db"]
        direction TB
        IMG["Image: postgres:16-alpine"]
        DATA["Data dir:\n/var/lib/postgresql/data"]
        ENV["Environment:\n• POSTGRES_USER=postgres\n• POSTGRES_PASSWORD=postgres123\n• POSTGRES_DB=cloudapp"]
    end

    VOL["💾 Volume: pgdata"] <-->|"mount"| DATA
    HOST["Host :5433"] <-->|"port map"| DB_DETAIL

    style DB_DETAIL fill:#E2EFDA,stroke:#548235
    style VOL fill:#FFF2CC,stroke:#BF8F00
```

| Konfigurasi | Nilai |
|-------------|-------|
| **Image** | `postgres:16-alpine` |
| **Container Name** | `db` |
| **Network** | `cloudnet` |
| **Port Mapping** | `5433:5432` (host:container) |
| **Volume** | `pgdata:/var/lib/postgresql/data` |
| **Database** | `cloudapp` |
| **Username** | `postgres` |
| **Password** | `postgres123` |

**Docker Run Command:**
```bash
docker run -d \
  --name db \
  --network cloudnet \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -e POSTGRES_DB=cloudapp \
  -p 5433:5432 \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

> 💡 Port di-map ke `5433` (bukan `5432`) agar tidak bentrok dengan PostgreSQL lokal yang mungkin berjalan di host.

---

### 2.2 Backend Container (`backend`)

```mermaid
flowchart LR
    subgraph BE_DETAIL["🐍 Backend Container: backend"]
        direction TB
        IMG["Image: cloudapp-backend:v2\n(python:3.12-slim multi-stage)"]
        APP["FastAPI + Uvicorn\nPort: 8000"]
        HC["HEALTHCHECK\ninterval=30s\ncurl /health"]
        USR["User: appuser (non-root)"]
    end

    DB["db:5432"] <-->|"postgresql://"| BE_DETAIL
    HOST["Host :8000"] <-->|"port map"| BE_DETAIL

    style BE_DETAIL fill:#FCE4D6,stroke:#BF8F00
```

| Konfigurasi | Nilai |
|-------------|-------|
| **Image** | `cloudapp-backend:v2` |
| **Base Image** | `python:3.12-slim` (multi-stage build) |
| **Container Name** | `backend` |
| **Network** | `cloudnet` |
| **Port Mapping** | `8000:8000` (host:container) |
| **Env File** | `backend/.env.docker` |
| **User** | `appuser` (non-root) |
| **Healthcheck** | `curl -f http://localhost:8000/health` (interval: 30s) |

**Environment Variables (`backend/.env.docker`):**

| Variable | Nilai | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | `postgresql://postgres:postgres123@db:5432/cloudapp` | Menggunakan `db` (nama container) sebagai hostname |
| `SECRET_KEY` | `(random string 32+ karakter)` | Untuk signing JWT token |
| `ALGORITHM` | `HS256` | Algoritma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expire 1 jam |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | CORS whitelist |

**Docker Run Command:**
```bash
docker run -d \
  --name backend \
  --network cloudnet \
  --env-file backend/.env.docker \
  -p 8000:8000 \
  cloudapp-backend:v2
```

**Dockerfile (Multi-Stage Build):**

```mermaid
flowchart TD
    subgraph STAGE1["🔨 Stage 1: Builder"]
        S1["FROM python:3.12-slim AS builder"]
        S2["Install deps ke /opt/venv"]
        S3["Install curl untuk healthcheck"]
    end

    subgraph STAGE2["🚀 Stage 2: Production"]
        S4["FROM python:3.12-slim"]
        S5["COPY --from=builder /opt/venv"]
        S6["COPY --from=builder curl"]
        S7["COPY app code"]
        S8["USER appuser"]
        S9["HEALTHCHECK + CMD uvicorn"]
    end

    STAGE1 -->|"Copy venv + curl"| STAGE2
    STAGE1 -.-|"🗑️ Dibuang"| TRASH["Build tools tidak\nmasuk final image"]

    style STAGE1 fill:#FFF2CC,stroke:#BF8F00
    style STAGE2 fill:#E2EFDA,stroke:#548235
    style TRASH fill:#f0f0f0,stroke:#999
```

---

### 2.3 Frontend Container (`frontend`)

```mermaid
flowchart LR
    subgraph FE_DETAIL["⚛️ Frontend Container: frontend"]
        direction TB
        IMG["Image: cloudapp-frontend:v1\n(nginx:alpine multi-stage)"]
        NGX["Nginx serving\nstatic React build"]
        SEC["Security headers:\n• X-Frame-Options\n• X-Content-Type-Options\n• HSTS"]
        GZ["Gzip compression: ON"]
    end

    HOST["Host :3000"] <-->|"port map → :80"| FE_DETAIL

    style FE_DETAIL fill:#E2D9F3,stroke:#7B68A5
```

| Konfigurasi | Nilai |
|-------------|-------|
| **Image** | `cloudapp-frontend:v1` |
| **Base Image** | Stage 1: `node:18-alpine`, Stage 2: `nginx:alpine` |
| **Container Name** | `frontend` |
| **Network** | `cloudnet` |
| **Port Mapping** | `3000:80` (host:container) |
| **Build Arg** | `VITE_API_URL=http://localhost:8000` |

**Nginx Features:**
- ✅ SPA routing (`try_files → /index.html`)
- ✅ Static asset caching (1 tahun, immutable)
- ✅ No-cache untuk `index.html`
- ✅ Gzip compression (level 5)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, XSS Protection)
- ✅ Custom error pages (404, 50x)
- ✅ Server tokens disabled

**Docker Run Command:**
```bash
docker run -d \
  --name frontend \
  --network cloudnet \
  -p 3000:80 \
  cloudapp-frontend:v1
```

**Dockerfile (Multi-Stage Build):**

```mermaid
flowchart TD
    subgraph STAGE1["🔨 Stage 1: Builder (node:18-alpine)"]
        N1["npm ci → install dependencies"]
        N2["npm run build → /app/dist/"]
    end

    subgraph STAGE2["🚀 Stage 2: Production (nginx:alpine)"]
        N3["COPY --from=builder /app/dist/"]
        N4["COPY nginx.conf"]
        N5["Final image: ~25 MB"]
    end

    STAGE1 -->|"Hanya /app/dist/"| STAGE2
    STAGE1 -.-|"🗑️ Dibuang"| TRASH["node_modules (300+ MB)\nBuild tools, source code"]

    style STAGE1 fill:#FFF2CC,stroke:#BF8F00
    style STAGE2 fill:#E2EFDA,stroke:#548235
    style TRASH fill:#f0f0f0,stroke:#999
```

---

## 3. Network Architecture

### 3.1 Docker Network: `cloudnet`

```mermaid
flowchart TD
    subgraph CLOUDNET["🌐 cloudnet (bridge network)"]
        FE["frontend\n(IP otomatis)"]
        BE["backend\n(IP otomatis)"]
        DB["db\n(IP otomatis)"]

        BE -->|"DNS: db:5432"| DB
    end

    BROWSER["👤 Browser"] -->|"localhost:3000"| FE
    BROWSER -->|"localhost:8000"| BE
    DEV["👨‍💻 Dev Tools"] -->|"localhost:5433"| DB

    style CLOUDNET fill:#DEEBF7,stroke:#2E75B6
```

### 3.2 Tabel Komunikasi

| Dari | Ke | URL/Hostname | Protokol | Keterangan |
|------|-----|-------------|----------|------------|
| Browser | Frontend | `localhost:3000` | HTTP | User akses UI |
| Browser | Backend | `localhost:8000` | HTTP | React fetch API (dari browser, bukan dari container) |
| Backend | Database | `db:5432` | PostgreSQL | DNS internal Docker network |
| Dev/Admin | Database | `localhost:5433` | PostgreSQL | Untuk debug via pgAdmin/psql |

> ⚠️ **Penting:** React app berjalan di **browser user**, bukan di dalam container frontend. Jadi saat React memanggil API, request dikirim dari browser ke `localhost:8000`, bukan dari container frontend ke container backend. Inilah mengapa `VITE_API_URL` di-set ke `http://localhost:8000` — bukan `http://backend:8000`.

### 3.3 Network Commands

```bash
# Buat network
docker network create cloudnet

# Lihat semua network
docker network ls

# Inspeksi network (lihat container anggota)
docker network inspect cloudnet

# Hapus network
docker network rm cloudnet
```

---

## 4. Volume Architecture

### 4.1 Named Volume: `pgdata`

```mermaid
flowchart TD
    subgraph LIFECYCLE["♻️ Lifecycle Volume"]
        C1["🏃 Container db v1\n(data: 100 rows)"] --> STOP1["docker stop + rm"]
        STOP1 --> VOL["💾 Volume: pgdata\n(data tetap ada!)"]
        VOL --> C2["🏃 Container db v2\n(data: 100 rows ✅)"]
    end

    style VOL fill:#FFF2CC,stroke:#BF8F00
    style C1 fill:#E2EFDA,stroke:#548235
    style C2 fill:#E2EFDA,stroke:#548235
```

| Konfigurasi | Nilai |
|-------------|-------|
| **Volume Name** | `pgdata` |
| **Mount Path** | `/var/lib/postgresql/data` |
| **Tipe** | Named Volume (managed by Docker) |
| **Persist** | ✅ Data tetap ada saat container dihapus |

### 4.2 Volume Commands

```bash
# Lihat semua volumes
docker volume ls

# Inspeksi volume
docker volume inspect pgdata

# Hapus volume (⚠️ data hilang!)
docker volume rm pgdata

# Hapus semua volume yang tidak terpakai
docker volume prune
```

---

## 5. Image Sizes

| Image | Build Type | Compressed | Uncompressed | Keterangan |
|-------|-----------|------------|--------------|------------|
| `cloudapp-backend:v1` | Single-stage | ~180 MB | ~450 MB | Modul 5 (deprecated) |
| `cloudapp-backend:v2` | ✅ Multi-stage | ~140 MB | ~305 MB | Modul 6 — 22% lebih kecil |
| `cloudapp-frontend:v1` | ✅ Multi-stage | ~25 MB | ~93 MB | Node.js build → Nginx serve |
| `postgres:16-alpine` | Official | ~100 MB | ~240 MB | Database |

---

## 6. Full Startup Sequence

```mermaid
flowchart TD
    START([🟢 Start]) --> NET["1️⃣ docker network create cloudnet"]
    NET --> DB["2️⃣ docker run db\n(PostgreSQL + volume pgdata)"]
    DB --> WAIT["3️⃣ Tunggu DB ready (~5 detik)"]
    WAIT --> BE["4️⃣ docker run backend\n(FastAPI + env-file)"]
    BE --> FE["5️⃣ docker run frontend\n(Nginx + React build)"]
    FE --> CHECK["6️⃣ Verifikasi"]
    CHECK --> END([✅ Semua Berjalan])

    CHECK --> V1["localhost:3000 → UI"]
    CHECK --> V2["localhost:8000 → API"]
    CHECK --> V3["docker ps → 3 containers"]

    style START fill:#70AD47,color:#fff
    style END fill:#70AD47,color:#fff
```

**Urutan penting:**
1. **Network** harus dibuat dulu
2. **Database** harus start duluan (backend butuh koneksi DB)
3. **Backend** start setelah database siap
4. **Frontend** bisa start kapan saja (tidak depend ke container lain secara langsung)

---

## 7. Helper Script

Tim menyediakan `scripts/docker-run.sh` untuk mempermudah operasi:

```bash
# Start semua container
bash scripts/docker-run.sh start

# Stop semua container
bash scripts/docker-run.sh stop

# Cek status
bash scripts/docker-run.sh status

# Lihat logs
bash scripts/docker-run.sh logs backend
```

> 🚧 **Minggu 7:** Semua operasi manual ini akan digantikan oleh **Docker Compose** — satu file `docker-compose.yml`, satu perintah `docker compose up`.

---

## 8. Troubleshooting

| Problem | Penyebab | Solusi |
|---------|----------|--------|
| Backend error: "connection refused to db" | Database belum ready | Tunggu 5 detik setelah start DB, atau gunakan `wait-for-db.sh` |
| Frontend: halaman kosong | `VITE_API_URL` salah saat build | Rebuild dengan `--build-arg VITE_API_URL=http://localhost:8000` |
| Data hilang setelah restart DB | Tidak pakai volume | Pastikan `-v pgdata:/var/lib/postgresql/data` |
| Container tidak bisa saling akses | Beda network | Pastikan semua pakai `--network cloudnet` |
| Port already in use | Port sudah dipakai | Ganti port mapping, misal `-p 8001:8000` |

---

*Dokumentasi ini dibuat oleh Lead QA & Documentation — Modul 6: Docker Lanjutan*
*Tanggal: 13 April 2026*
