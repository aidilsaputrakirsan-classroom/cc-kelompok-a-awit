# Git Workflow & Aturan Kolaborasi Tim

Dokumen ini berisi panduan alur kerja (workflow) Git yang disepakati oleh tim untuk repository PalmTrack Cloud. Panduan ini wajib diikuti oleh seluruh anggota tim agar proses development berjalan rapi, terlacak, dan terhindar dari konflik kode (conflict).

---

## 1. Branch Naming Convention (Penamaan Branch)

Setiap pengembangan fitur, perbaikan bug, atau dokumentasi harus dilakukan di **branch terpisah** (bukan di `main`). Kita menggunakan format berikut:

**Format:** `tipe/deskripsi-singkat` (lowercase, kebab-case)

| Tipe | Kapan Digunakan | Contoh |
|------|-----------------|--------|
| `feature/` | Menambah fitur baru | `feature/dashboard-stats` |
| `fix/` | Memperbaiki bug atau error | `fix/login-token-expired` |
| `docs/` | Mengubah atau menambah dokumentasi | `docs/api-documentation` |
| `refactor/`| Perbaikan kode tanpa mengubah behaviour | `refactor/split-crud-service` |
| `chore/` | Maintenance, config, perubahan dependencies | `chore/update-requirements` |

**Contoh alur pembuatan branch baru:**
```bash
git checkout main
git pull origin main
git checkout -b feature/nama-fitur
```

---

## 2. Commit Message Convention

Kita menggunakan **Conventional Commits** untuk memudahkan tracking riwayat perubahan. 

**Format commit message:**
```
tipe: deskripsi singkat
```

| Tipe | Kapan Digunakan | Contoh |
|------|-----------------|--------|
| `feat` | Menambahkan fitur baru | `feat: add user profile page` |
| `fix` | Memperbaiki bug | `fix: resolve JWT token expiry issue` |
| `docs` | Perubahan dokumentasi | `docs: update API endpoint list in README` |
| `refactor`| Refactoring struktur kode | `refactor: extract auth logic to separate module` |
| `chore` | Maintenance dan dependency | `chore: update python dependencies` |
| `test` | Menambahkan/memperbaiki test | `test: add unit tests for CRUD operations` |
| `style` | Formatting (indentasi, spasi) | `style: fix indentation in docker-compose.yml` |

---

## 3. Pull Request (PR) Process

**PENTING: Tidak ada yang boleh melakukan `push` secara langsung ke branch `main`!**
Semua perubahan harus melalui mekanisme Pull Request (PR).

**Alur Pull Request:**
1. Selesaikan pekerjaan pada branch fitur/fix Anda.
2. Lakukan push ke remote repository: `git push origin nama-branch`
3. Buka GitHub dan buat **Pull Request** dari branch Anda ke branch `main`.
4. Isi judul dan deskripsi PR secara jelas (disarankan menggunakan PR template yang ada).
5. Secara otomatis, sistem akan men-assign **Reviewers** berdasarkan konfigurasi `CODEOWNERS`.
6. Tunggu reviewer menyelesaikan review dan memberikan **Approve**.
7. Setelah diapprove, lakukan merge menggunakan opsi **Squash and merge**.
8. Hapus (Delete) branch fitur setelah berhasil di-merge.

---

## 4. Review Guidelines

Proses code review bertujuan untuk menjaga kualitas kode, menemukan bug, dan saling belajar, bukan untuk mengkritik personal.

**Tugas Reviewer:**
- Memeriksa apakah fungsionalitas berjalan dengan baik dan sesuai ekspektasi.
- Memeriksa apakah kode mengikuti standar (best practices, naming convention).
- Mengecek keamanan (tidak ada secret key/password yang hardcoded).
- Menggunakan fitur komentar di GitHub secara spesifik pada baris kode yang relevan.

**Cara memberikan komentar review:**
- **[Praise]:** Berikan pujian untuk kode yang rapi atau solusi yang bagus.
- **[Suggestion]:** Berikan saran perbaikan (contoh: "Sebaiknya variabel ini menggunakan camelCase").
- **[Question]:** Tanyakan jika ada bagian kode yang kurang dipahami.
- Jangan gunakan kata-kata yang menghakimi (contoh: "Kodenya salah"). Fokus pada masalah dan perbaikannya.

---

## 5. Referensi Reviewer Otomatis (CODEOWNERS)

Untuk memperlancar proses assign reviewer, kita telah mengkonfigurasi file `.github/CODEOWNERS`. Saat sebuah PR dibuat, GitHub akan otomatis meng-assign reviewer sesuai area kode yang diubah:

- **Backend** (`/backend/`) → `@adamimir` (Lead Backend)
- **Frontend** (`/frontend/`) → `@alvhayen` (Lead Frontend)
- **Docker, Infrastructure, Makefile** → `@VarrelKaleb89` (Lead DevOps)
- **Dokumentasi & README** (`/docs/`, `README.md`) → `@Adonia76` (Lead QA & Docs)
- **CI/CD** (`/.github/workflows/`) → `@10231005` (Lead CI/CD)

*Jika PR mencakup beberapa area (misalnya perubahan backend dan frontend sekaligus), maka kedua reviewer terkait akan otomatis dipanggil.*
