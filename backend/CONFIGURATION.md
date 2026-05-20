# Configuration Management - PalmChain Backend

Dokumentasi lengkap untuk configuration management backend PalmChain.

## Daftar Isi
- [Struktur Konfigurasi](#struktur-konfigurasi)
- [Environment Variables](#environment-variables)
- [Development vs Production](#development-vs-production)
- [Cara Setup](#cara-setup)
- [Contoh Konfigurasi](#contoh-konfigurasi)

## Struktur Konfigurasi

Konfigurasi backend diatur melalui file **`backend/config.py`** yang membaca environment variables dari file `.env`.

```
backend/
├── config.py           # ← Centralized configuration
├── main.py            # Import dari config
├── database.py        # Import dari config
├── auth.py            # Import dari config
├── .env               # Local development (ignored by git)
└── .env.example       # Template untuk .env
```

### File Konfigurasi

| File | Tujuan |
|------|--------|
| `config.py` | Settings class yang membaca env vars dengan default values |
| `.env` | Local development variables (jangan commit ke git) |
| `.env.example` | Template / dokumentasi env vars yang diperlukan |
| `.env.docker` | Variables untuk Docker container |

## Environment Variables

### ENVIRONMENT (Wajib)
```bash
ENVIRONMENT=development  # development, production, staging
```

**Efek:**
- `DEBUG` otomatis set ke `true` jika `development`, `false` sebaliknya
- Docs UI hanya muncul di mode development
- Logging level berubah otomatis

### DATABASE_URL (Wajib)
```bash
# Development (PostgreSQL lokal)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudapp

# Production (managed database)
DATABASE_URL=postgresql://user:password@prod-host.com:5432/cloudapp_prod
```

**Fallback:** Jika kosong, akan use default development database.

### SECRET_KEY (Wajib di Production)
```bash
# Development (bisa menggunakan default)
SECRET_KEY=dev-secret-key-change-in-production

# Production (WAJIB: minimal 32 karakter, random)
SECRET_KEY=your-secure-random-key-at-least-32-characters-long!!!
```

**⚠️ PENTING:**
- Jangan gunakan default secret key di production
- Generate dengan: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Jangan commit ke repository

### ALGORITHM (Opsional)
```bash
ALGORITHM=HS256  # Default: HS256
```

### ACCESS_TOKEN_EXPIRE_MINUTES (Opsional)
```bash
ACCESS_TOKEN_EXPIRE_MINUTES=60  # Default: 60 menit
```

### CORS_ORIGINS (Wajib di Production)
```bash
# Development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Production (pisahkan dengan koma, tanpa spasi setelah comma)
CORS_ORIGINS=https://app.example.com,https://www.example.com
```

**Fallback:** Jika kosong, menggunakan localhost untuk development.

### LOG_LEVEL (Opsional)
```bash
LOG_LEVEL=DEBUG      # development: DEBUG
LOG_LEVEL=INFO       # production: INFO
```

Pilihan: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

## Development vs Production

### Development Mode
```bash
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ENABLE_DOCS=true
LOG_LEVEL=DEBUG
```

**Fitur:**
- ✅ Swagger UI aktif (`/docs`)
- ✅ ReDoc aktif (`/redoc`)
- ✅ Verbose logging
- ✅ Database echo enabled
- ✅ CORS permissive

### Production Mode
```bash
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://app.example.com
ENABLE_DOCS=false
LOG_LEVEL=INFO
SECRET_KEY=<secure-key>
```

**Fitur:**
- ❌ Swagger UI disabled
- ❌ ReDoc disabled
- ✅ Production logging
- ✅ CORS strict
- ✅ Validasi keamanan ketat

## Cara Setup

### 1. Development (Lokal)

**Copy template:**
```bash
cd backend
cp .env.example .env
```

**Edit `.env` sesuai kebutuhan:**
```bash
ENVIRONMENT=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudapp
SECRET_KEY=dev-secret-key-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Jalankan aplikasi:**
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload

# Akses Swagger UI
# http://localhost:8000/docs
```

### 2. Production (Server)

**Set environment variables di server:**
```bash
# Via .env file
cp .env.example .env
# Edit .env dengan production values

# Atau via environment (Docker/Kubernetes)
export ENVIRONMENT=production
export DATABASE_URL=postgresql://user:password@prod-db:5432/cloudapp
export SECRET_KEY=<your-secure-secret-key>
export CORS_ORIGINS=https://app.example.com
```

**Jalankan dengan gunicorn:**
```bash
pip install gunicorn
gunicorn main:app -w 4 -b 0.0.0.0:8000 --timeout 60
```

### 3. Docker

**Development:**
```bash
docker compose up --build -d
```

**.env** akan di-load otomatis dari local `.env` file.

**Production:**
```bash
# Build image
docker build -t palmchain-backend:latest .

# Run dengan environment variables
docker run -d \
  -e ENVIRONMENT=production \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY=... \
  -e CORS_ORIGINS=https://app.example.com \
  -p 8000:8000 \
  palmchain-backend:latest
```

## Contoh Konfigurasi

### Contoh 1: Development Lokal
```ini
ENVIRONMENT=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudapp
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
LOG_LEVEL=DEBUG
```

### Contoh 2: Production AWS
```ini
ENVIRONMENT=production
DATABASE_URL=postgresql://admin:SecurePass123@cloudapp-db.xxxxx.us-east-1.rds.amazonaws.com:5432/cloudapp_prod
SECRET_KEY=prod-secure-key-min-32-chars-random-generated!!!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
CORS_ORIGINS=https://app.palmchain.io,https://www.palmchain.io
LOG_LEVEL=INFO
```

### Contoh 3: Docker Compose
```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    environment:
      ENVIRONMENT: development
      DATABASE_URL: postgresql://postgres:postgres@db:5432/cloudapp
      SECRET_KEY: dev-key
      CORS_ORIGINS: http://localhost:5173
```

### Contoh 4: Kubernetes Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-config
type: Opaque
stringData:
  ENVIRONMENT: production
  DATABASE_URL: postgresql://user:pass@prod-db:5432/cloudapp
  SECRET_KEY: prod-secure-key
  CORS_ORIGINS: https://app.example.com
```

## Checklist Setup

- [ ] Copy `.env.example` ke `.env`
- [ ] Edit `.env` dengan nilai yang sesuai
- [ ] Pastikan `DATABASE_URL` valid dan database berjalan
- [ ] Pastikan `SECRET_KEY` di-set untuk production
- [ ] Test dengan `python -c "from config import settings; print(settings)"`
- [ ] Jalankan aplikasi dan buka `/health` endpoint
- [ ] Verifikasi CORS bekerja dari frontend
- [ ] Check logs untuk warning atau error

## Troubleshooting

### Error: "DATABASE_URL tidak ditemukan"
**Solusi:** Pastikan `.env` file ada dan `DATABASE_URL` variable di-set.

### Error: "SECRET_KEY harus didefinisikan di production"
**Solusi:** Set `SECRET_KEY` di environment variables.

### CORS Error: "Origin not allowed"
**Solusi:** Pastikan frontend URL ada di `CORS_ORIGINS`.

### Dokumentasi tidak muncul di production
**Solusi:** Ini normal! Swagger docs disabled di production untuk security. Gunakan `.env.example` sebagai dokumentasi.

---

**Last Updated:** May 2026  
**Backend Lead:** Adam Ibnu Ramadhan
