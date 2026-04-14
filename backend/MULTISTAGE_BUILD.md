# Backend Multi-Stage Build Documentation

## Overview
Dockerfile backend menggunakan **multi-stage build** untuk mengoptimalkan ukuran image production.

## Architecture

### Stage 1: Builder
```dockerfile
FROM python:3.12-slim AS builder
```
- **Tujuan:** Install dependencies di virtual environment
- **Size:** ~200-300 MB (dengan dependencies)
- **Kebutuhan:** Python, pip, build tools
- **Artifacts yang disimpan:**
  - `/opt/venv/` — virtual environment lengkap
  - Dependencies di dalam venv

### Stage 2: Production
```dockerfile
FROM python:3.12-slim
```
- **Tujuan:** Final image untuk production
- **Copy dari Stage 1:** `/opt/venv` (venv saja)
- **Tambahan:** PostgreSQL client untuk `pg_isready`, curl untuk healthcheck
- **Size:** ~150 MB (only venv + app code, without build tools)

## Image Size Comparison

| Approach | Size |
|----------|------|
| ❌ Single-stage (semua di satu stage) | ~250-300 MB |
| ✅ Multi-stage (optimized) | ~150 MB |
| 📉 **Reduction** | **~45% lebih kecil** |

## Cara Kerja

### 1. Stage 1: Builder (Build-time)
```dockerfile
FROM python:3.12-slim AS builder

WORKDIR /app
COPY requirements.txt .

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies (dengan cache)
RUN pip install --no-cache-dir -r requirements.txt

# Copy build tools yang tidak perlu di production
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
```

**Hasil:** `/opt/venv` berisi semua dependencies yang sudah installed

### 2. Stage 2: Production (Runtime)
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Copy HANYA venv dari builder (tidak perlu re-install)
COPY --from=builder /opt/venv /opt/venv

# Copy library yang dibutuhkan untuk curl
COPY --from=builder /usr/bin/curl /usr/bin/curl
COPY --from=builder /usr/lib/x86_64-linux-gnu/lib*.so* /usr/lib/x86_64-linux-gnu/

# Copy app code
COPY . .

# Setup user, healthcheck, etc
USER appuser
HEALTHCHECK ...
ENTRYPOINT ["/app/wait-for-db.sh"]
CMD ["uvicorn", "main:app", ...]
```

**Hasil:** Image production hanya berisi venv + app code (~150 MB)

## Build & Push

### Build Image
```bash
cd backend
docker build -t cloudapp-backend:v2 .
```

### Check Image Size
```bash
docker images cloudapp-backend:v2
# Lihat SIZE column — seharusnya ~150 MB
```

### Push ke Docker Hub
```bash
docker tag cloudapp-backend:v2 USERNAME/cloudapp-backend:v2
docker push USERNAME/cloudapp-backend:v2
```

## Keuntungan Multi-Stage Build

| Aspek | Keuntungan |
|-------|-----------|
| **Image Size** | Lebih kecil (~45% reduction) → faster download, less storage |
| **Security** | Tidak ada build tools di production image |
| **Performance** | Faster container startup (less I/O) |
| **Best Practice** | Standard approach untuk production |
| **Cache** | Builder stage di-cache, rebuild lebih cepat |

## Layer Caching

### Layer yang jarang berubah (caching bagus)
```dockerfile
FROM python:3.12-slim AS builder    # Cache ✅
WORKDIR /app                         # Cache ✅
COPY requirements.txt .              # Cache ✅ (hanya berubah jika requirements.txt berubah)
RUN python -m venv /opt/venv         # Cache ✅
RUN pip install ...                  # Cache ✅
```

### Layer yang sering berubah (rebuild)
```dockerfile
COPY . .                             # Rebuild 🔄 (setiap kali kode berubah)
```

## Troubleshooting

### Image masih besar (~300 MB)
- ✓ Pastikan `--no-cache-dir` di pip install (menghindari menyimpan package cache)
- ✓ Hapus apt cache setelah install: `rm -rf /var/lib/apt/lists/*`
- ✓ Gunakan alpine base image: `python:3.12-alpine` (lebih kecil)

### Build lambat
- ✓ Pastikan Docker desktop punya cukup memory
- ✓ Check layer caching: `docker build --progress=plain ...`

### `curl` tidak bisa diakses di production stage
- ✓ Pastikan copy binary dan libraries dari builder: `COPY --from=builder /usr/bin/curl /usr/bin/curl`
- ✓ Copy dependency libraries yang diperlukan curl

## Advanced: Alpine Base Image

Untuk image lebih kecil, bisa gunakan Alpine (30 MB vs 50 MB slim):

```dockerfile
FROM python:3.12-alpine AS builder
# ... sama seperti di atas ...

FROM python:3.12-alpine
COPY --from=builder /opt/venv /opt/venv
# ... dst ...
```

**Trade-off:**
- ✅ Lebih kecil (~100 MB)
- ❌ Lebih banyak kompatibilitas issues dengan library C
- ❌ Build bisa lebih lambat (compile dari source)

**Rekomendasi:** Pakai `slim` untuk balance antara ukuran dan kompatibilitas.
