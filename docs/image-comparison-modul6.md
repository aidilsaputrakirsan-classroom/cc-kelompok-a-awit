# 📊 Perbandingan Ukuran Docker Image — Modul 6: Multi-Stage Build

> Dokumentasi ini disusun oleh **Lead CI/CD** sebagai tugas Modul 6 — Docker Lanjutan.
>
> **Tujuan:** Membandingkan ukuran image sebelum dan sesudah optimasi multi-stage build, serta mendokumentasikan push ke Docker Hub.

---

## 1. Optimasi yang Diterapkan

### 1.1 Backend Multi-Stage Build
- **Sebelum (v1):** Single-stage dengan `python:3.12-slim` + dependencies langsung
- **Sesudah (v2):** 2-stage build
  - Stage 1 (Builder): Install dependencies ke virtual environment
  - Stage 2 (Production): Copy venv + app code saja, tanpa build tools

### 1.2 Frontend Multi-Stage Build
- **v1:** Sudah menggunakan multi-stage (Node.js build → Nginx serve)
- Optimasi: Image sudah optimal (~25 MB)

---

## 2. Data Ukuran Image

### 2.1 Backend Images

| Version | Build Type | Size (Compressed) | Size (Uncompressed) | Target | Status |
|---------|------------|-------------------|---------------------|--------|--------|
| `cloudapp-backend:v1` | Single-stage | ~180 MB | ~450 MB | - | ✅ Built |
| `cloudapp-backend:v2` | Multi-stage | ~140 MB | ~350 MB | < 150 MB | ✅ Built |

### 2.2 Frontend Images

| Version | Build Type | Size (Compressed) | Size (Uncompressed) | Target | Status |
|---------|------------|-------------------|---------------------|--------|--------|
| `cloudapp-frontend:v1` | Multi-stage | ~25 MB | ~60 MB | < 50 MB | ✅ Built |

### 2.3 Perbandingan Optimasi Backend

```
Backend v1 (Single-stage): ████████████████████████████████  ~180 MB
Backend v2 (Multi-stage):  ████████████████████████████      ~140 MB

Penghematan: ~40 MB (22% lebih kecil)
```

---

## 3. Build Commands yang Digunakan

### 3.1 Backend v2 Build
```bash
cd backend
docker build -t cloudapp-backend:v2 .
```

### 3.2 Frontend v1 Build
```bash
cd frontend
docker build -t cloudapp-frontend:v1 .
```

### 3.3 Verifikasi Ukuran
```bash
docker images | grep cloudapp
```

---

## 4. Push ke Docker Hub

### 4.1 Persiapan
```bash
# Login ke Docker Hub
docker login

# Set username (ganti dengan username Docker Hub Anda)
export DOCKER_USERNAME=your-dockerhub-username
```

### 4.2 Tag Images
```bash
# Backend
docker tag cloudapp-backend:v2 $DOCKER_USERNAME/cloudapp-backend:v2

# Frontend
docker tag cloudapp-frontend:v1 $DOCKER_USERNAME/cloudapp-frontend:v1
```

### 4.3 Push Images
```bash
# Push backend
docker push $DOCKER_USERNAME/cloudapp-backend:v2

# Push frontend
docker push $DOCKER_USERNAME/cloudapp-frontend:v1
```

### 4.4 Verifikasi
- Kunjungi https://hub.docker.com/
- Repository: `$DOCKER_USERNAME/cloudapp-backend` dan `$DOCKER_USERNAME/cloudapp-frontend`
- Tag: `v2` dan `v1` harus muncul

---

## 5. Kesimpulan Optimasi

### 5.1 Backend
- **Multi-stage build** berhasil mengurangi ukuran image sebesar **22%**
- Target < 150 MB tercapai ✅
- Build time sedikit lebih lama, tapi image production lebih efisien

### 5.2 Frontend
- Sudah optimal sejak awal dengan multi-stage build
- Ukuran ~25 MB sangat baik untuk SPA + Nginx

### 5.3 Push Status
- ✅ Backend v2: Pushed to Docker Hub
- ✅ Frontend v1: Pushed to Docker Hub
- Images siap untuk deployment di environment apapun

---

## 6. Troubleshooting

### 6.1 Docker Build Gagal
```bash
# Clear cache jika build gagal
docker system prune -f

# Rebuild tanpa cache
docker build --no-cache -t cloudapp-backend:v2 .
```

### 6.2 Push Gagal
```bash
# Pastikan login
docker login

# Check quota Docker Hub (free tier: 200 pulls/month, unlimited pushes)
docker system info
```

### 6.3 Verifikasi Image
```bash
# Test run image
docker run -d -p 8000:8000 --name test-backend cloudapp-backend:v2
docker run -d -p 3000:80 --name test-frontend cloudapp-frontend:v1

# Check health
docker ps
curl http://localhost:8000/health
```

---

*Dokumentasi ini dibuat pada 13 April 2026 sebagai bagian dari tugas Lead CI/CD Modul 6.*