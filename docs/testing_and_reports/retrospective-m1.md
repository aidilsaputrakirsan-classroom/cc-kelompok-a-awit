# Retrospective — Milestone 1 (Minggu 1-8: UTS)

**Tanggal:** 18 Mei 2026  
**Tim:** Cloud Team A — Awit  
**Project:** PalmTrack Cloud (PalmChain)

---

## 🟢 Apa yang Berjalan Baik?

1. **Adaptasi project domain berhasil** — Tim berhasil mengadaptasi project dari template inventaris generik menjadi PalmChain (sistem monitoring pengangkutan TBS kelapa sawit) dengan domain spesifik: vendor/kontraktor, blok panen, dan actual hauling.

2. **Docker Compose berjalan lancar** — Setup multi-container (backend FastAPI + frontend React + PostgreSQL) menggunakan Docker Compose berhasil diimplementasikan dalam satu sesi. Healthcheck dan dependency antar service berjalan dengan baik.

3. **Dokumentasi teknis cukup lengkap** — Dokumen seperti `api-documentation.md`, `docker-architecture.md`, `ui-test-results.md`, dan `auth-test-results.md` berhasil dibuat sesuai deliverable setiap modul.

4. **Frontend berkembang pesat** — UI mengalami banyak perbaikan dari Login/Register sederhana menjadi dashboard lengkap dengan sidebar navigation, CRUD contractor, dan manajemen blok panen.

5. **Backend solid dengan fitur inti** — Endpoint CRUD, autentikasi JWT, dan health check sudah berjalan dengan baik. Migrasi schema ke PalmChain (vendor, blocks, hauling) berjalan lancar.

---

## 🔴 Apa yang Perlu Diperbaiki?

1. **Kontribusi commit tidak merata** — Distribusi commit masih timpang (beberapa anggota memiliki commit jauh lebih banyak dari yang lain). Ini perlu diperbaiki agar setiap anggota menunjukkan kontribusi yang jelas di Git history.

2. **Tidak menggunakan PR workflow sejak awal** — Selama Minggu 1-7, semua push dilakukan langsung ke `main`. Ini menyebabkan beberapa kali kode bentrok dan susah di-trace siapa yang mengubah apa. Baru mulai pakai PR di Minggu 9.

3. **Beberapa deliverable dokumentasi terlambat** — File seperti `uts-demo-script.md` belum sempat dibuat sebelum UTS. Perlu lebih disiplin mengikuti checklist deliverable per modul.

4. **Commit message kurang konsisten** — Beberapa commit masih menggunakan pesan generik seperti "Update Form Add New" atau "Buat Branch Baru" tanpa mengikuti Conventional Commits secara konsisten.

5. **File yang tidak perlu ikut ter-commit** — Beberapa file seperti `test.txt`, `test.db`, dan `.venv/` ikut ter-push ke repository. Perlu memperketat `.gitignore`.

---

## 🔵 Action Items untuk Milestone 2

1. **Gunakan PR dan code review secara konsisten** — Setiap perubahan harus melalui feature branch dan PR. Tidak ada lagi push langsung ke `main`.

2. **Perbaiki distribusi kontribusi** — Setiap anggota minimal memiliki kontribusi commit yang signifikan setiap minggu sesuai perannya.

3. **Ikuti checklist deliverable per modul** — Setiap akhir pertemuan, pastikan semua deliverable QA (docs) sudah selesai sebelum lanjut ke modul berikutnya.

4. **Terapkan Conventional Commits** — Semua commit message harus mengikuti format: `tipe: deskripsi singkat` (feat, fix, docs, chore, test, refactor).

5. **Bersihkan repository** — Tambahkan `test.db`, `test.txt`, `.venv/` ke `.gitignore` dan hapus dari tracking.

6. **Setup CI/CD** — Implementasi GitHub Actions untuk automated testing agar kualitas kode terjaga setiap PR.

---

## 📊 Kontribusi Tim (Milestone 1)

| Anggota | Peran | Kontribusi Utama | Jumlah Commit |
|---------|-------|-----------------|---------------|
| Alfian Fadillah Putra | Lead Frontend | UI/UX, sidebar, CRUD contractor, dark mode | 38 |
| Adam Ibnu Ramadhan | Lead Backend | Backend PalmChain, models, endpoints, auth | 26 |
| Adhyasta Firdaus | Lead CI/CD | PR template, CI pipeline, testing setup | 20 |
| Adonia Azarya Tamalonggehe | Lead QA & Docs | Testing, dokumentasi, README | 9 |
| Varrel Kaleb Ropard Pasaribu | Lead DevOps | Docker Compose, Makefile, production profile | 7 |

> **Catatan:** Jumlah commit dihitung dari `git shortlog -sn --all` per 18 Mei 2026. Beberapa anggota memiliki commit dari multiple Git identities yang sudah digabungkan.

---

## 📝 Lessons Learned

- **Branch protection lebih baik diterapkan sejak awal** — Meskipun menambah langkah, PR workflow mencegah kode rusak masuk ke `main`.
- **Dokumentasi yang dibuat bersamaan dengan kode** lebih akurat daripada yang ditulis belakangan.
- **Docker Compose sangat mempermudah onboarding** — Anggota baru bisa menjalankan seluruh stack hanya dengan `docker compose up -d`.
