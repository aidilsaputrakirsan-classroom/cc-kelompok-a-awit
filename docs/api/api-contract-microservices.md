# API Contract — PalmTrack Cloud (Fase Microservices)

> **Tanggal Dokumen:** 09 Juni 2026
> **Penulis:** Adonia Azarya Tamalonggehe (Lead QA & Documentation)
> **Versi:** 2.0.0 (Microservices)
> **Base URL (via Gateway):** `http://localhost` (Development) / `https://cc-kelompok-a-awit.akhzafachrozy.my.id` (Production)

---

## Konvensi Umum

| Aspek | Aturan |
|-------|--------|
| Format request body | `application/json` |
| Format response | `application/json` |
| Autentikasi | `Authorization: Bearer <JWT_TOKEN>` di header |
| Timestamp | ISO 8601 (`2026-06-09T00:00:00`) |
| Error format | `{"detail": "pesan error"}` |

### Status Code yang Digunakan

| Code | Makna |
|------|-------|
| `200 OK` | Request berhasil |
| `201 Created` | Resource berhasil dibuat |
| `204 No Content` | Berhasil (tanpa response body, khusus DELETE) |
| `400 Bad Request` | Data tidak valid / email sudah terdaftar |
| `401 Unauthorized` | Token tidak ada, invalid, atau expired |
| `404 Not Found` | Resource tidak ditemukan |
| `503 Service Unavailable` | Auth Service tidak bisa dihubungi dari Item Service |
| `504 Gateway Timeout` | Auth Service tidak merespons dalam batas waktu |

---

## 🔐 Auth Service

**Internal Port:** `8001`
**Gateway Prefix:** `/auth/`
**Contoh akses via Gateway:** `POST http://localhost/auth/register`

> Semua endpoint Auth Service **tidak memerlukan autentikasi** (kecuali `/verify`).

---

### `GET /auth/health`

Mengecek status kesehatan Auth Service.

**Request:** Tidak ada body.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```

---

### `POST /auth/register`

Mendaftarkan user baru ke sistem.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nama Lengkap"
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `email` | string | ✅ | Harus unik, format email valid |
| `password` | string | ✅ | Akan di-hash dengan bcrypt |
| `name` | string | ✅ | Nama tampilan user |

**Response `201 Created`:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Nama Lengkap",
  "created_at": "2026-06-09T00:00:00"
}
```

**Response `400 Bad Request`** (email sudah terdaftar):
```json
{
  "detail": "Email already registered"
}
```

---

### `POST /auth/login`

Login dan mendapatkan JWT access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response `401 Unauthorized`** (email atau password salah):
```json
{
  "detail": "Invalid email or password"
}
```

---

### `GET /auth/verify`

> ⚠️ **Endpoint Internal** — Dipanggil oleh **Item Service** untuk memverifikasi token. Tidak diakses langsung oleh frontend.

Memverifikasi JWT token dan mengembalikan data user.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response `200 OK`:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "name": "Nama Lengkap"
}
```

**Response `401 Unauthorized`** (token invalid/expired):
```json
{
  "detail": "Token expired"
}
```
atau
```json
{
  "detail": "Invalid token"
}
```

---

## 📦 Item Service

**Internal Port:** `8002`
**Gateway Prefix:** `/items`
**Contoh akses via Gateway:** `GET http://localhost/items`

> ⚠️ **Semua endpoint Item Service memerlukan autentikasi.** Setiap request harus menyertakan header `Authorization: Bearer <token>`. Item Service akan memanggil `GET /verify` ke Auth Service secara internal untuk memvalidasi token sebelum memproses request.

---

### `GET /items/health`

Mengecek status kesehatan Item Service.

**Request:** Tidak ada body.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "item-service",
  "version": "2.0.0"
}
```

---

### `POST /items`

Membuat item baru. Item akan otomatis dikaitkan dengan `owner_id` user yang sedang login.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Nama Item",
  "description": "Deskripsi item",
  "price": 150000.0,
  "quantity": 10
}
```

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama item |
| `description` | string | ❌ | Deskripsi opsional |
| `price` | float | ✅ | Harga dalam rupiah |
| `quantity` | integer | ✅ | Jumlah stok |

**Response `201 Created`:**
```json
{
  "id": 1,
  "name": "Nama Item",
  "description": "Deskripsi item",
  "price": 150000.0,
  "quantity": 10,
  "owner_id": 1,
  "created_at": "2026-06-09T00:00:00"
}
```

**Response `401 Unauthorized`** (token tidak valid):
```json
{
  "detail": "Invalid or expired token"
}
```

**Response `503 Service Unavailable`** (Auth Service tidak bisa dihubungi):
```json
{
  "detail": "Auth service unavailable"
}
```

---

### `GET /items`

Mengambil daftar item milik user yang sedang login, dengan dukungan pencarian dan paginasi.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| Parameter | Tipe | Default | Keterangan |
|-----------|------|---------|------------|
| `search` | string | — | Filter nama item (case-insensitive) |
| `skip` | integer | `0` | Jumlah item yang dilewati (offset) |
| `limit` | integer | `20` | Jumlah item per halaman (max: 100) |

**Contoh Request:**
```
GET /items?search=kelapa&skip=0&limit=10
```

**Response `200 OK`:**
```json
{
  "total": 42,
  "items": [
    {
      "id": 1,
      "name": "Kelapa Sawit Grade A",
      "description": "TBS kualitas premium",
      "price": 2500.0,
      "quantity": 100,
      "owner_id": 1,
      "created_at": "2026-06-09T00:00:00"
    }
  ]
}
```

---

### `GET /items/{item_id}`

Mengambil detail satu item berdasarkan ID. Hanya item milik user yang login yang bisa diakses.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameter:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `item_id` | integer | ID item yang ingin diambil |

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Kelapa Sawit Grade A",
  "description": "TBS kualitas premium",
  "price": 2500.0,
  "quantity": 100,
  "owner_id": 1,
  "created_at": "2026-06-09T00:00:00"
}
```

**Response `404 Not Found`** (item tidak ada atau bukan milik user):
```json
{
  "detail": "Item not found"
}
```

---

### `PUT /items/{item_id}`

Memperbarui data item. Hanya item milik user yang login yang bisa diperbarui.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameter:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `item_id` | integer | ID item yang ingin diperbarui |

**Request Body** (semua field opsional — hanya field yang dikirim yang akan diperbarui):
```json
{
  "name": "Nama Baru",
  "description": "Deskripsi baru",
  "price": 175000.0,
  "quantity": 15
}
```

**Response `200 OK`:**
```json
{
  "id": 1,
  "name": "Nama Baru",
  "description": "Deskripsi baru",
  "price": 175000.0,
  "quantity": 15,
  "owner_id": 1,
  "created_at": "2026-06-09T00:00:00"
}
```

**Response `404 Not Found`:**
```json
{
  "detail": "Item not found"
}
```

---

### `DELETE /items/{item_id}`

Menghapus item. Hanya item milik user yang login yang bisa dihapus.

**Request Header:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameter:**
| Parameter | Tipe | Keterangan |
|-----------|------|------------|
| `item_id` | integer | ID item yang ingin dihapus |

**Response `204 No Content`:** *(tidak ada body)*

**Response `404 Not Found`:**
```json
{
  "detail": "Item not found"
}
```

---

## 🔗 Inter-Service Communication Contract

Bagian ini mendokumentasikan komunikasi **antar service** (bukan dari frontend ke gateway), sebagai referensi untuk tim Backend dan QA.

### Item Service → Auth Service: Verifikasi Token

Setiap kali Item Service menerima request yang membutuhkan autentikasi, ia akan memanggil endpoint `/verify` milik Auth Service secara internal.

```
Item Service (port 8002)  →  Auth Service (port 8001)
GET http://auth-service:8001/verify
Header: Authorization: Bearer <token>
Timeout: 5 detik
```

**Flow lengkap:**

```
Client Request → Gateway → Item Service → Auth Service /verify → [OK] → Process Request
                                                               ↘ [401] → Return 401 to Client
                                                               ↘ [timeout] → Return 504 to Client
                                                               ↘ [connection error] → Return 503 to Client
```

### Kemungkinan Kegagalan Inter-Service

| Skenario Gagal | HTTP Code ke Client | Keterangan |
|---------------|---------------------|------------|
| Token invalid/expired | `401` | Auth Service merespons 401 |
| Auth Service tidak jalan | `503` | `httpx.ConnectError` |
| Auth Service lambat (>5s) | `504` | `httpx.TimeoutException` |

---

## 📋 Ringkasan Semua Endpoint

| Method | Endpoint (via Gateway) | Auth? | Fungsi |
|--------|----------------------|-------|--------|
| `GET` | `/auth/health` | ❌ | Health check auth service |
| `POST` | `/auth/register` | ❌ | Daftar user baru |
| `POST` | `/auth/login` | ❌ | Login, dapat token |
| `GET` | `/auth/verify` | ✅ (internal) | Verifikasi token (inter-service) |
| `GET` | `/items/health` | ❌ | Health check item service |
| `POST` | `/items` | ✅ | Buat item baru |
| `GET` | `/items` | ✅ | Daftar item dengan paginasi & search |
| `GET` | `/items/{id}` | ✅ | Detail satu item |
| `PUT` | `/items/{id}` | ✅ | Update item |
| `DELETE` | `/items/{id}` | ✅ | Hapus item |
| `GET` | `/health` | ❌ | Health check gateway |

---

*Dokumen ini disusun oleh **Adonia Azarya Tamalonggehe** (Lead QA & Documentation) sebagai deliverable Modul 12 — API Contract Microservices.*
*Institut Teknologi Kalimantan — Komputasi Awan 2026.*
