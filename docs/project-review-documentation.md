# 📋 PalmChain — Project Review & Testing Documentation

> **Tanggal Review:** 21 April 2026  
> **Reviewer:** QA & Documentation Team  
> **Versi API:** 1.0.0 (PalmChain)

---

## 📌 Ringkasan Proyek

**PalmChain** (sebelumnya e-Mandor) adalah sistem monitoring rantai pasok TBS (Tandan Buah Segar) kelapa sawit berbasis cloud. Aplikasi ini telah bermigrasi dari sistem inventory sederhana menjadi platform supply chain monitoring dengan fitur:

- **Master Data Vendor** — CRUD data kontraktor/vendor transport
- **Master Data Block** — CRUD data blok/afdeling panen
- **Hauling Transactions** — Pencatatan transaksi pengangkutan TBS
- **Dashboard** — Statistik harian dan Month-To-Date
- **Authentication** — JWT-based auth dengan register/login

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network (cloudnet)             │
│                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Frontend │    │   Backend    │    │  PostgreSQL   │  │
│  │  Nginx   │───▶│   FastAPI    │───▶│   Database    │  │
│  │ :3000→80 │    │    :8000     │    │  :5432        │  │
│  └──────────┘    └──────────────┘    └───────────────┘  │
│   React+Vite      Python 3.12        postgres:16-alpine │
│   Multi-stage     Multi-stage        Volume: pgdata     │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Frontend | React + Vite + Recharts | React 19, Vite 7 |
| Routing | react-router-dom | 7.14 |
| Icons | lucide-react | 1.8 |
| Backend | Python + FastAPI | 3.12 / 0.115.0 |
| ORM | SQLAlchemy | 2.0.35 |
| Validation | Pydantic | 2.9.0 |
| Auth | python-jose + passlib (bcrypt) | JWT HS256 |
| Database | PostgreSQL | 16-alpine |
| Container | Docker + Docker Compose | v3.8 |
| Web Server | Nginx (frontend) | alpine |

---

## 📁 Struktur Proyek (Aktual)

```
cc-kelompok-a-awit/
├── docker-compose.yml              ← Orchestration 3 services
├── backend/
│   ├── Dockerfile                   ← Multi-stage build (builder → production)
│   ├── main.py                      ← FastAPI app: 20 endpoints
│   ├── models.py                    ← SQLAlchemy: MasterVendor, MasterBlock,
│   │                                  HaulingTransaction, User
│   ├── schemas.py                   ← Pydantic: 17 schema classes
│   ├── crud.py                      ← Business logic: 15 CRUD functions
│   ├── auth.py                      ← JWT + bcrypt auth utilities
│   ├── database.py                  ← PostgreSQL connection via SQLAlchemy
│   ├── palmchain_schema.sql         ← Reference SQL schema + sample data
│   └── requirements.txt             ← 10 Python dependencies
├── frontend/
│   ├── Dockerfile                   ← Multi-stage: Node build → Nginx serve
│   ├── nginx.conf                   ← Gzip, security headers, SPA routing
│   ├── src/
│   │   ├── App.jsx                  ← Root: AuthProvider + Routes
│   │   ├── context/AuthContext.jsx  ← Auth state management
│   │   ├── services/api.js          ← 17 API functions + token management
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx   ← Auth guard
│   │   │   └── LoginGate.jsx        ← Redirect if logged in
│   │   ├── layouts/MainLayout.jsx   ← Sidebar + Topbar + Outlet
│   │   ├── components/              ← 15 reusable components
│   │   └── pages/                   ← 5 pages (Dashboard, Contractors,
│   │                                   Blocks, Hauling, Items)
│   └── package.json
├── scripts/                         ← Docker management scripts
└── docs/                            ← Documentation files
```

---

## 🔌 API Endpoint Reference (Aktual)

### Public Endpoints (No Auth)

| Method | Endpoint | Deskripsi | Status Code |
|--------|----------|-----------|-------------|
| `GET` | `/health` | Health check API | 200 |
| `GET` | `/team` | Informasi tim | 200 |
| `POST` | `/auth/register` | Registrasi user baru | 201 / 400 / 422 |
| `POST` | `/auth/login` | Login (JSON body) | 200 / 401 |
| `POST` | `/auth/token` | OAuth2 token endpoint (form data) | 200 / 401 |

### Protected Endpoints (Bearer Token Required)

| Method | Endpoint | Deskripsi | Status Code |
|--------|----------|-----------|-------------|
| `GET` | `/auth/me` | Profil user login | 200 / 401 |
| **Vendors** | | | |
| `POST` | `/api/vendors` | Buat vendor baru | 201 / 400 / 401 |
| `GET` | `/api/vendors` | List vendors (pagination, search, filter) | 200 / 401 |
| `GET` | `/api/vendors/{id}` | Detail vendor by UUID | 200 / 401 / 404 |
| `PUT` | `/api/vendors/{id}` | Update vendor | 200 / 401 / 404 |
| `DELETE` | `/api/vendors/{id}` | Hapus vendor | 204 / 401 / 404 |
| **Blocks** | | | |
| `POST` | `/api/blocks` | Buat block baru | 201 / 400 / 401 |
| `GET` | `/api/blocks` | List blocks (pagination, search, filter) | 200 / 401 |
| `GET` | `/api/blocks/{id}` | Detail block by UUID | 200 / 401 / 404 |
| `PUT` | `/api/blocks/{id}` | Update block | 200 / 401 / 404 |
| `DELETE` | `/api/blocks/{id}` | Hapus block | 204 / 401 / 404 |
| **Hauling** | | | |
| `POST` | `/api/hauling-transactions` | Buat hauling transaction | 201 / 400 / 401 |
| `GET` | `/api/hauling-transactions` | List hauling (pagination, filter) | 200 / 401 |
| `GET` | `/api/hauling-transactions/{id}` | Detail hauling by UUID | 200 / 401 / 404 |
| `PUT` | `/api/hauling-transactions/{id}` | Update hauling | 200 / 401 / 404 |
| `DELETE` | `/api/hauling-transactions/{id}` | Hapus hauling | 204 / 401 / 404 |
| **Dashboard** | | | |
| `GET` | `/api/dashboard` | Dashboard summary (today + MTD stats) | 200 / 401 |

**Total: 22 endpoints** (5 public + 17 protected)

---

## 🗄️ Database Schema

### Tabel `master_vendors`

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| `id` | UUID | PK, auto-gen | Primary key |
| `code` | VARCHAR(10) | UNIQUE, NOT NULL, INDEX | Kode vendor |
| `name` | VARCHAR(100) | NOT NULL | Nama vendor |
| `type` | VARCHAR(50) | nullable | Tipe: Transportir/Petani Swadaya/Inti |
| `phone` | VARCHAR(15) | nullable | Nomor telepon |
| `email` | VARCHAR(100) | nullable | Email |
| `status` | BOOLEAN | DEFAULT true | Status aktif |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | ON UPDATE | Waktu diubah |

### Tabel `master_blocks`

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| `id` | UUID | PK, auto-gen | Primary key |
| `block_code` | VARCHAR(10) | UNIQUE, NOT NULL, INDEX | Kode blok |
| `division` | VARCHAR(50) | nullable | Afdeling |
| `hectarage` | FLOAT | nullable | Luas area (hektar) |
| `vendor_id` | UUID | FK → master_vendors, ON DELETE SET NULL | Vendor terkait |
| `status` | BOOLEAN | DEFAULT true | Status aktif |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | ON UPDATE | Waktu diubah |

### Tabel `hauling_transactions`

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| `id` | UUID | PK, auto-gen | Primary key |
| `ticket_no` | VARCHAR(20) | UNIQUE, NOT NULL, INDEX | Nomor tiket |
| `vendor_id` | UUID | FK → master_vendors | Vendor pengangkut |
| `block_id` | UUID | FK → master_blocks | Blok asal TBS |
| `vehicle_plate` | VARCHAR(15) | NOT NULL | Nomor plat kendaraan |
| `weight_in` | FLOAT | NOT NULL | Berat kotor (Ton) |
| `weight_out` | FLOAT | NOT NULL | Berat kosong (Ton) |
| `net_weight` | FLOAT | calculated | Tonase TBS = weight_in − weight_out |
| `gate_in_time` | TIMESTAMPTZ | DEFAULT NOW(), INDEX | Waktu masuk |
| `gate_out_time` | TIMESTAMPTZ | nullable | Waktu keluar |
| `status` | VARCHAR(20) | DEFAULT 'completed' | Status: completed/pending/cancelled |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu dibuat |
| `updated_at` | TIMESTAMPTZ | ON UPDATE | Waktu diubah |

### Tabel `users`

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| `id` | INTEGER | PK, autoincrement | Primary key |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | Email user |
| `name` | VARCHAR(100) | NOT NULL | Nama user |
| `hashed_password` | VARCHAR(255) | NOT NULL | Password (bcrypt hash) |
| `is_active` | BOOLEAN | DEFAULT true | Status aktif |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu dibuat |

### Relasi Antar Tabel

```
master_vendors 1──────N master_blocks        (vendor_id FK)
master_vendors 1──────N hauling_transactions (vendor_id FK)
master_blocks  1──────N hauling_transactions (block_id FK)
```

---

## 🔐 Authentication Flow

### Alur Lengkap

```
1. POST /auth/register  →  Buat akun (email, name, password)
2. POST /auth/login     →  Dapatkan access_token (JWT, valid 60 menit)
3. Setiap request       →  Header: Authorization: Bearer <token>
4. Logout               →  Hapus token dari client (localStorage)
```

### Password Requirements
- Minimal 8 karakter
- Mengandung huruf (A-Z, a-z)
- Mengandung angka (0-9)
- Mengandung special character (!@#$%^&*)

### Token Storage (Frontend)
- Key: `palmtrack_access_token` di `localStorage`
- Sync ke memori via `syncTokenFromStorage()` saat app load
- Auto-clear pada response 401

---

## 🧪 Code Review & Testing Results

### ✅ Kekuatan (Strengths)

| Area | Temuan |
|------|--------|
| **Arsitektur** | Clean separation: models → schemas → crud → main (layered architecture) |
| **Auth** | JWT implementation solid: bcrypt hashing, token expiry, non-root user check, active user check |
| **Docker** | Multi-stage builds for both backend (~140MB) and frontend (~25MB), non-root user, healthcheck |
| **Database** | Proper use of UUIDs for domain entities, integer PK for users, foreign key relationships with ON DELETE SET NULL |
| **Frontend** | Well-structured: Context API for auth, protected routes, centralized API service layer |
| **Validation** | Pydantic schemas with field validators for email format and password strength |
| **Error Handling** | Consistent error responses, 401 auto-logout, validation error parsing in frontend |
| **Security** | Nginx security headers (X-Frame-Options, HSTS, XSS Protection), CORS whitelist, non-root Docker user |
| **Docker Compose** | Health checks, dependency ordering (db → backend → frontend), named volumes for persistence |

### ⚠️ Temuan & Rekomendasi (Findings)

#### 1. Dokumentasi API Tidak Sinkron (HIGH)
**Masalah:** `docs/api-documentation.md` masih mendokumentasikan endpoint lama (`/items` inventory CRUD). Backend sudah bermigrasi ke PalmChain (`/api/vendors`, `/api/blocks`, `/api/hauling-transactions`, `/api/dashboard`).

**Rekomendasi:** Update `docs/api-documentation.md` agar sesuai dengan endpoint aktual (dokumen ini bisa dijadikan referensi).

#### 2. Legacy Items Endpoints Masih Ada di Frontend (MEDIUM)
**Masalah:** `api.js` masih memiliki fungsi `fetchItems`, `createItem`, `updateItem`, `deleteItem` yang memanggil `/items` endpoints. Endpoint `/items` tidak ada di `main.py` aktual.

**File:** `frontend/src/services/api.js` (lines 119-161)
**File:** `frontend/src/pages/ItemsPage.jsx`

**Rekomendasi:** Hapus atau migrasikan ke endpoint PalmChain jika tidak digunakan.

#### 3. HaulingPage Placeholder (MEDIUM)
**Masalah:** `frontend/src/pages/HaulingPage.jsx` hanya berisi 347 bytes — kemungkinan masih placeholder.

**Rekomendasi:** Implementasikan UI hauling transaction yang lengkap (form + table + CRUD).

#### 4. Net Weight Tidak Auto-Calculate di ORM (LOW)
**Masalah:** `net_weight` di SQL schema menggunakan `GENERATED ALWAYS AS (weight_in - weight_out) STORED`, tapi di SQLAlchemy model, `net_weight` hanya `Column(Float)` biasa tanpa default/computed.

**File:** `backend/models.py` line 61
**Rekomendasi:** Tambahkan kalkulasi `net_weight = weight_in - weight_out` di `crud.py` sebelum commit, atau gunakan SQLAlchemy `Computed` column.

#### 5. Hardcoded Target Tonage (LOW)
**Masalah:** Target tonage di dashboard hardcoded 500.0 ton di `main.py` line 435.

**Rekomendasi:** Pindahkan ke environment variable atau config table di database.

#### 6. Deprecated Import (LOW)
**Masalah:** `database.py` menggunakan `from sqlalchemy.ext.declarative import declarative_base` yang deprecated di SQLAlchemy 2.0.

**Rekomendasi:** Ganti dengan `from sqlalchemy.orm import DeclarativeBase`.

#### 7. README Roadmap Belum Update (LOW)
**Masalah:** README masih menunjukkan Week 7 (Docker Compose) sebagai belum selesai (⬜), padahal `docker-compose.yml` sudah lengkap.

---

## 🐳 Docker Review

### docker-compose.yml

| Service | Image | Port | Status |
|---------|-------|------|--------|
| `db` | postgres:16-alpine | 5432:5432 | ✅ Health check (pg_isready) |
| `backend` | ./backend (multi-stage) | 8000:8000 | ✅ depends_on db (healthy), healthcheck |
| `frontend` | ./frontend (multi-stage) | 3000:80 | ✅ depends_on backend |

**Network:** `cloudnet` (bridge driver)  
**Volume:** `pgdata` (persistent PostgreSQL data)

### Backend Dockerfile Review

| Best Practice | Status |
|--------------|--------|
| Multi-stage build | ✅ Builder → Production |
| Slim base image | ✅ python:3.12-slim |
| Layer cache optimization | ✅ requirements.txt copied first |
| Non-root user | ✅ `appuser` |
| .dockerignore | ✅ Excludes .env, __pycache__, .git |
| Healthcheck | ✅ curl /health every 30s |
| No cache pip install | ✅ `--no-cache-dir` |

### Frontend Dockerfile Review

| Best Practice | Status |
|--------------|--------|
| Multi-stage build | ✅ Node build → Nginx serve |
| npm ci | ✅ Clean, reproducible install |
| Build-time env vars | ✅ ARG VITE_API_URL |
| Alpine-based Nginx | ✅ Minimal image size |
| Custom nginx.conf | ✅ Gzip, security headers, SPA routing |

---

## 🔄 Frontend Route Map

```
/login              → LoginPage (public, redirects to /dashboard if logged in)
/                   → Redirect to /dashboard
/dashboard          → Dashboard (protected) — stats + charts
/master-data/contractors → MasterDataContractorPage (protected) — vendor CRUD
/master-data/blocks → BlocksPage (protected) — block CRUD
/transactions/hauling → HaulingPage (protected) — placeholder
/items              → ItemsPage (protected) — legacy inventory
*                   → Redirect to /dashboard
```

---

## 📊 Component Inventory

### Frontend Components (15)

| Component | File | Fungsi |
|-----------|------|--------|
| LoginPage | LoginPage.jsx | Login/Register form with tab switch |
| Sidebar | Sidebar.jsx | Navigation sidebar with collapse |
| Header | Header.jsx | App header |
| ContractorForm | ContractorForm.jsx | Form create/edit vendor |
| ContractorTable | ContractorTable.jsx | Table display vendors |
| ContractorLogoCell | ContractorLogoCell.jsx | Logo cell in table |
| ContractorPagination | ContractorPagination.jsx | Pagination controls |
| BlockForm | BlockForm.jsx | Form create/edit block |
| BlockTable | BlockTable.jsx | Table display blocks |
| ItemForm | ItemForm.jsx | Legacy: form create/edit item |
| ItemCard | ItemCard.jsx | Legacy: card display item |
| ItemList | ItemList.jsx | Legacy: list of item cards |
| SearchBar | SearchBar.jsx | Search input with clear |
| SortBar | SortBar.jsx | Sort controls |
| Notification | Notification.jsx | Toast notification |

### Backend Modules (5)

| Module | Fungsi | LOC |
|--------|--------|-----|
| main.py | FastAPI app, 22 endpoint definitions | 456 |
| crud.py | 15 CRUD + 2 stats functions | 354 |
| schemas.py | 17 Pydantic schema classes | 239 |
| auth.py | JWT + bcrypt utilities | 124 |
| models.py | 4 SQLAlchemy models | 82 |
| database.py | DB connection + session | 37 |

---

## 🧪 Test Scenarios (Manual Testing Guide)

### A. Authentication Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| A1 | Register user baru | POST `/auth/register` with valid data | 201, user object returned |
| A2 | Register duplicate email | POST `/auth/register` with same email | 400, "Email sudah terdaftar" |
| A3 | Register weak password | POST `/auth/register` with "123" | 422, validation error |
| A4 | Login valid | POST `/auth/login` with correct credentials | 200, access_token returned |
| A5 | Login invalid password | POST `/auth/login` with wrong password | 401, "Email atau password salah" |
| A6 | Access protected without token | GET `/api/vendors` without header | 401 |
| A7 | Access with valid token | GET `/auth/me` with Bearer token | 200, user profile |

### B. Vendor CRUD Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| B1 | Create vendor | POST `/api/vendors` with valid data | 201, vendor with UUID |
| B2 | Create duplicate code | POST `/api/vendors` with same code | 400, "Vendor code sudah terdaftar" |
| B3 | List vendors | GET `/api/vendors` | 200, {total, vendors[]} |
| B4 | Search vendor | GET `/api/vendors?search=jaya` | 200, filtered results |
| B5 | Get vendor by ID | GET `/api/vendors/{uuid}` | 200, vendor detail |
| B6 | Get invalid UUID | GET `/api/vendors/invalid` | 400, "Invalid vendor ID format" |
| B7 | Update vendor | PUT `/api/vendors/{uuid}` | 200, updated vendor |
| B8 | Delete vendor | DELETE `/api/vendors/{uuid}` | 204, no content |
| B9 | Get deleted vendor | GET `/api/vendors/{deleted-uuid}` | 404, "Vendor tidak ditemukan" |

### C. Block CRUD Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| C1 | Create block | POST `/api/blocks` with valid data | 201, block with UUID |
| C2 | Create with vendor_id | POST `/api/blocks` with existing vendor_id | 201, block linked to vendor |
| C3 | List blocks with filter | GET `/api/blocks?status=true` | 200, only active blocks |
| C4 | Update block | PUT `/api/blocks/{uuid}` | 200, updated block |
| C5 | Delete block | DELETE `/api/blocks/{uuid}` | 204 |

### D. Hauling Transaction Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| D1 | Create hauling | POST `/api/hauling-transactions` | 201, transaction with net_weight |
| D2 | Duplicate ticket | POST with same ticket_no | 400, "Ticket number sudah terdaftar" |
| D3 | List with vendor filter | GET `/api/hauling-transactions?vendor_id={uuid}` | 200, filtered |
| D4 | List with status filter | GET `?status=completed` | 200, only completed |
| D5 | Update status | PUT `/{uuid}` with status change | 200, updated |
| D6 | Delete hauling | DELETE `/{uuid}` | 204 |

### E. Dashboard Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| E1 | Get dashboard empty | GET `/api/dashboard` (no data) | 200, zeros |
| E2 | Get dashboard with data | GET `/api/dashboard` (after creating transactions) | 200, calculated stats |

### F. Frontend UI Tests

| # | Test Case | Steps | Expected |
|---|-----------|-------|----------|
| F1 | Login page loads | Navigate to `/login` | Login form displayed |
| F2 | Login redirects | Login with valid credentials | Redirected to dashboard |
| F3 | Dashboard renders | View `/dashboard` | Stats cards + charts shown |
| F4 | Contractor CRUD | Create/edit/delete contractor | All operations work via UI |
| F5 | Block CRUD | Create/edit/delete block | All operations work via UI |
| F6 | Logout | Click logout button | Redirected to login page |
| F7 | Protected route | Access `/dashboard` without login | Redirected to `/login` |

---

## 📝 Catatan Penting untuk Week 7+ (Docker Compose)

### Menjalankan Seluruh Stack

```bash
# Start semua services
docker compose up -d

# Lihat status
docker compose ps

# Lihat logs
docker compose logs -f

# Stop semua
docker compose down

# Stop + hapus volume (reset database)
docker compose down -v
```

### Environment Variables (docker-compose.yml)

| Variable | Service | Value |
|----------|---------|-------|
| `DATABASE_URL` | backend | `postgresql://postgres:postgres123@db:5432/cloudapp` |
| `SECRET_KEY` | backend | `your-secret-key-here-change-in-production` |
| `ALGORITHM` | backend | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | backend | `60` |
| `ALLOWED_ORIGINS` | backend | `http://localhost:3000,http://localhost:5173,http://frontend` |
| `POSTGRES_USER` | db | `postgres` |
| `POSTGRES_PASSWORD` | db | `postgres123` |
| `POSTGRES_DB` | db | `cloudapp` |

---

## ✅ QA Checklist — Week 7 (Docker Compose)

### Backend
- [ ] `docker compose up` berhasil menjalankan 3 services
- [ ] Backend health check (`/health`) returns 200
- [ ] Database terhubung (test POST `/auth/register`)
- [ ] Semua 22 endpoint berfungsi via container
- [ ] CORS memperbolehkan request dari `http://localhost:3000`

### Frontend
- [ ] Login page tampil di `http://localhost:3000`
- [ ] Register → Login → Dashboard flow berfungsi
- [ ] Contractor CRUD berfungsi via UI
- [ ] Block CRUD berfungsi via UI
- [ ] Logout mengembalikan ke login page

### Docker
- [ ] `docker compose ps` menunjukkan 3 containers healthy
- [ ] Data persist setelah `docker compose down` dan `up` (volume test)
- [ ] `docker compose down -v` menghapus data (clean state)
- [ ] Container restart otomatis (test: `docker kill backend`)

### Dokumentasi
- [ ] `docs/api-documentation.md` di-update ke endpoint PalmChain aktual
- [ ] README roadmap Week 7 ditandai ✅ Selesai
- [ ] Semua `.env.example` files lengkap dan terdokumentasi

---

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Adam Ibnu Ramadhan | 10231003 | Lead Backend |
| Alfian Fadillah Putra | 10231009 | Lead Frontend |
| Varrel Kaleb Ropard Pasaribu | 10231089 | Lead Container |
| Adhyasta Firdaus | 10231005 | Lead CI/CD & Deploy |
| Adonia Azarya Tamalonggehe | 10231007 | Lead QA & Docs |

---

*Dokumen ini dibuat sebagai hasil review dan testing menyeluruh proyek PalmChain.*  
*Institut Teknologi Kalimantan — Komputasi Awan 2026.*
