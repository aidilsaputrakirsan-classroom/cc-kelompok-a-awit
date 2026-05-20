# Release Notes — Milestone 2 (v2.0)

**Tanggal Rilis:** 19 Mei 2026  
**Versi:** 2.0 (Milestone 2 - Fase CI/CD & Deployment)  
**Tim:** Cloud Team A — Awit  

---

## 🚀 Fitur dan Perubahan Utama

Milestone 2 berfokus pada stabilitas, kolaborasi tim, dan deployment. Berikut adalah pembaruan utama sejak Milestone 1 (UTS):

1. **GitHub Actions CI Pipeline Terintegrasi**
   - Penambahan workflow `.github/workflows/ci.yml` untuk melakukan *automated testing* (pytest & Vitest) pada setiap Pull Request.
   - Penambahan linter (`ruff` untuk backend) ke dalam pipeline.
2. **Git Workflow & Branch Protection**
   - Branch `main` kini dilindungi (*protected*). Semua perubahan fitur harus melewati Pull Request.
   - Implementasi `.github/CODEOWNERS` untuk otomatisasi penugasan Reviewer (Backend, Frontend, DevOps, QA).
3. **Dokumentasi Lengkap Fase 2**
   - `retrospective-m1.md` (Evaluasi Milestone 1)
   - `git-workflow.md` (Aturan Branching & Pull Request)
   - `testing-guide.md` (Panduan eksekusi test lokal dan CI)
4. **Production Profile Docker Compose**
   - Pemisahan environment *development* dan *production* menggunakan `docker-compose.prod.yml`.
   - Konfigurasi sekuritas tambahan (menyembunyikan port DB di production, pembatasan CORS).
5. **Fitur Frontend (Minor Update)**
   - Perbaikan UI/UX, penambahan fitur Dark Mode, dan *About Page* tim.

---

## 🔗 URL Production

Aplikasi PalmTrack Cloud kini telah di-*deploy* dan dapat diakses publik:
- **Frontend (Web App):** `https://palmtrack.awit.cloud` *(Note: ganti dengan URL aslimu jika berbeda)*
- **Backend (API Docs):** `https://api.palmtrack.awit.cloud/docs`

---

## 🛠️ Tech Stack & Infrastruktur Saat Ini

- **Frontend:** React, Vite, CSS Modules (Nginx Container)
- **Backend:** FastAPI, Python 3.12 (Uvicorn Container)
- **Database:** PostgreSQL 15
- **Orchestration:** Docker & Docker Compose
- **CI/CD:** GitHub Actions

---

## ⚠️ Known Issues (Masalah yang Diketahui)

1. Fitur transaksi *Actual Hauling* masih dalam tahap integrasi akhir (UI belum sepenuhnya memanggil endpoint backend).
2. Pipeline CI saat ini belum memiliki tahap CD (Continuous Deployment) otomatis ke server production. Deployment masih dilakukan manual (pull & `docker compose up`).
3. Belum ada fitur *password reset* atau notifikasi email jika lupa password.

---

*(Release notes disusun oleh Lead QA & Documentation)*
