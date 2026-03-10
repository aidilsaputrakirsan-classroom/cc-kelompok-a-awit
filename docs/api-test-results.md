# Dokumentasi Hasil Testing Endpoint API
## Tugas 2 — Lead Frontend | Modul 2: Backend REST API (FastAPI + PostgreSQL)
**Mata Kuliah:** Komputasi Awan  
**Program Studi:** Sistem Informasi — Institut Teknologi Kalimantan  
**Tools Testing:** Swagger UI (`http://localhost:8000/docs`)  
**Base URL:** `http://localhost:8000`  
**Tanggal Testing:** 08–09 Maret 2026  

---

## Pendahuluan

Dokumen ini merupakan hasil pengujian seluruh endpoint REST API yang dibangun pada Workshop 2 Modul 2. Pengujian dilakukan menggunakan Swagger UI sesuai alur yang ditetapkan dalam modul, mencakup skenario sukses maupun skenario error untuk memverifikasi bahwa setiap endpoint berperilaku sesuai kontrak API yang telah didefinisikan. Sebagai Lead Frontend, pemahaman terhadap format request dan response dari setiap endpoint sangat krusial sebelum membangun antarmuka React pada pertemuan berikutnya.

---

## Ringkasan Endpoint yang Diuji

| No | Method | Endpoint | Deskripsi | Status Code Sukses |
|----|--------|----------|-----------|-------------------|
| 1 | GET | `/health` | Health Check | 200 |
| 2 | POST | `/items` | Create Item | 201 |
| 3 | GET | `/items` | List Items (pagination + search) | 200 |
| 4 | GET | `/items/{item_id}` | Get Item by ID | 200 / 404 |
| 5 | PUT | `/items/{item_id}` | Update Item (partial) | 200 |
| 6 | DELETE | `/items/{item_id}` | Delete Item | 204 |
| 7 | GET | `/items/stats` | Statistik Inventory | 200 |

---

## Alur Testing (Sesuai Workshop 2.5)

Pengujian dilakukan mengikuti alur yang ditetapkan di modul, yaitu:
```
Buka /docs → POST /items (×3) → GET /items → GET /items/1 →
PUT /items/1 → GET /items/1 (verifikasi) → GET /items?search=laptop →
DELETE /items/1 → GET /items/1 (harus 404) → GET /items/stats
```

---

## Detail Hasil Pengujian Per Endpoint

---

### 1. GET `/health` — Health Check

**Deskripsi:**
Endpoint untuk memverifikasi bahwa API server sedang aktif dan siap menerima request. Tidak memerlukan parameter apapun. Endpoint ini penting untuk monitoring di lingkungan cloud dan biasanya menjadi target pengecekan oleh load balancer.

**Request:**
```http
GET http://localhost:8000/health
Accept: application/json
```

**Curl:**
```bash
curl -X 'GET' \
  'http://localhost:8000/health' \
  -H 'accept: application/json'
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `200 OK` |
| Content-Type | `application/json` |
| Content-Length | 38 |
| Server | uvicorn |

**Response Body:**
```json
{
  "status": "healthy",
  "version": "0.2.0"
}
```

**Catatan Frontend:**
Response ini dapat digunakan oleh frontend untuk menampilkan indikator status koneksi ke server. Jika `status` bernilai `"healthy"`, frontend dapat lanjut melakukan request ke endpoint lainnya.

---

### 2. POST `/items` — Create Item

**Deskripsi:**
Endpoint untuk membuat item baru di database. Data dikirim melalui request body dalam format JSON. Validasi dilakukan oleh Pydantic schema `ItemCreate` di sisi backend.

**Request:**
```http
POST http://localhost:8000/items
Accept: application/json
Content-Type: application/json
```

**Curl:**
```bash
curl -X 'POST' \
  'http://localhost:8000/items' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Laptop",
    "description": "Laptop untuk cloud computing",
    "price": 10000,
    "quantity": 10
  }'
```

**Request Body (ItemCreate schema):**
```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 10000,
  "quantity": 10
}
```

> Selama workshop, tiga item berikut berhasil dibuat sesuai instruksi modul:
> 1. `Laptop` — price: 15000000, quantity: 10
> 2. `Mouse Wireless` — price: 250000, quantity: 20  
> 3. `Keyboard Mechanical` — price: 1200000, quantity: 5

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `201 Created` |
| Content-Type | `application/json` |
| Content-Length | 165 |
| Server | uvicorn |

**Response Body (ItemResponse schema):**
```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 10000,
  "quantity": 10,
  "id": 2,
  "created_at": "2026-03-09T15:14:44.620594+08:00",
  "updated_at": null
}
```

**Response Headers:**
```
access-control-allow-credentials: true
access-control-allow-origin: *
content-length: 165
content-type: application/json
date: Mon, 09 Mar 2026 07:14:43 GMT
server: uvicorn
```

**Skema Error (422 — Validation Error):**
```json
{
  "detail": [
    {
      "loc": ["string", 0],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

**Catatan Frontend:**
- `id` di-generate otomatis oleh database — frontend tidak perlu mengirimnya.
- `created_at` menggunakan timezone `+08:00` (WIB), sehingga tidak perlu konversi zona waktu saat ditampilkan ke pengguna.
- `updated_at` bernilai `null` saat pertama kali dibuat — frontend perlu menangani nilai `null` ini agar tidak menyebabkan error rendering.
- Header `access-control-allow-origin: *` sudah terpasang, artinya tidak akan ada isu CORS saat frontend diakses dari port yang berbeda (misalnya `localhost:3000` untuk React dev server).

---

### 3. GET `/items` — List Items

**Deskripsi:**
Endpoint untuk mengambil daftar seluruh item dengan dukungan pagination dan pencarian. Response menggunakan schema `ItemListResponse` yang menyertakan `total` dan array `items`.

**Parameter Query:**

| Parameter | Tipe | Default | Constraint | Keterangan |
|-----------|------|---------|------------|------------|
| `skip` | integer | 0 | min: 0 | Offset untuk pagination |
| `limit` | integer | 20 | min: 1, max: 100 | Jumlah item per halaman |
| `search` | string | — | — | Cari berdasarkan nama/deskripsi (opsional) |

#### Skenario A — Tanpa Filter (Ambil Semua Item)

**Request:**
```http
GET http://localhost:8000/items?skip=0&limit=20
Accept: application/json
```

**Hasil:** `200 OK` — Mengembalikan seluruh item yang ada.

#### Skenario B — Dengan Filter Pencarian (`search=laptop`)

**Request:**
```http
GET http://localhost:8000/items?skip=0&limit=20&search=laptop
Accept: application/json
```

**Curl:**
```bash
curl -X 'GET' \
  'http://localhost:8000/items?skip=0&limit=20&search=laptop' \
  -H 'accept: application/json'
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `200 OK` |
| Content-Type | `application/json` |

**Response Body (ItemListResponse schema):**
```json
{
  "total": 2,
  "items": [
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 10000,
      "quantity": 10,
      "id": 2,
      "created_at": "2026-03-09T15:14:44.620594+08:00",
      "updated_at": null
    },
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 10000,
      "quantity": 10,
      "id": 6,
      "created_at": "2026-03-09T15:14:42.173208+08:00",
      "updated_at": null
    }
  ]
}
```

**Catatan Frontend:**
- Field `total` digunakan untuk menghitung jumlah halaman pada komponen pagination — rumusnya: `totalPages = Math.ceil(total / limit)`.
- Fitur `search` melakukan pencarian case-insensitive (`ilike`) pada kolom `name` dan `description` sekaligus, sesuai implementasi di `crud.py`.
- Untuk implementasi infinite scroll atau load more, parameter `skip` bisa dinaikkan secara dinamis dari frontend.

---

### 4. GET `/items/{item_id}` — Get Item by ID

**Deskripsi:**
Endpoint untuk mengambil detail satu item berdasarkan ID uniknya yang diteruskan sebagai path parameter.

**Parameter Path:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `item_id` | integer | Ya | ID unik item di database |

#### Skenario A — Item Ditemukan (ID: 4)

**Request:**
```http
GET http://localhost:8000/items/4
Accept: application/json
```

**Curl:**
```bash
curl -X 'GET' \
  'http://localhost:8000/items/4' \
  -H 'accept: application/json'
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `200 OK` |
| Content-Type | `application/json` |
| Content-Length | 161 |
| Server | uvicorn |

**Response Body:**
```json
{
  "name": "Mouse Wireless",
  "description": "Mouse bluetooth",
  "price": 250000,
  "quantity": 20,
  "id": 4,
  "created_at": "2026-03-04T13:44:38.000587+08:00",
  "updated_at": null
}
```

#### Skenario B — Item Tidak Ditemukan (ID: 4, setelah dihapus)

Setelah item dengan ID 4 dihapus melalui endpoint DELETE, pengujian GET kembali dilakukan untuk memverifikasi bahwa data benar-benar tidak tersimpan di database.

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `404 Not Found` |
| Content-Type | `application/json` |
| Content-Length | 45 |

**Response Body:**
```json
{
  "detail": "Item dengan id=4 tidak ditemukan"
}
```

**Catatan Frontend:**
- Frontend wajib menangani status `404` secara eksplisit — misalnya menampilkan halaman "Item tidak ditemukan" atau mengarahkan pengguna kembali ke halaman daftar item menggunakan React Router.
- Pesan error dari backend sudah dalam Bahasa Indonesia dan cukup deskriptif, sehingga bisa langsung ditampilkan ke pengguna.

---

### 5. PUT `/items/{item_id}` — Update Item

**Deskripsi:**
Endpoint untuk memperbarui data item berdasarkan ID. Menggunakan schema `ItemUpdate` di mana **semua field bersifat opsional**, sehingga frontend cukup mengirimkan field yang ingin diubah saja (partial update).

**Parameter Path:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `item_id` | integer | Ya | ID item yang akan diperbarui |

**Request (update harga item ID: 4):**
```http
PUT http://localhost:8000/items/4
Accept: application/json
Content-Type: application/json
```

**Curl:**
```bash
curl -X 'PUT' \
  'http://localhost:8000/items/4' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "price": 10231003
  }'
```

**Request Body (ItemUpdate schema — hanya field yang diubah):**
```json
{
  "price": 10231003
}
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `200 OK` |
| Content-Type | `application/json` |

**Response Body:**
```json
{
  "name": "Mouse Wireless",
  "description": "Mouse bluetooth",
  "price": 10231003,
  "quantity": 20,
  "id": 4,
  "created_at": "2026-03-04T13:44:38.000587+08:00",
  "updated_at": "2026-03-09T15:17:52.482716+08:00"
}
```

**Verifikasi dengan GET `/items/4`:**

Setelah update dilakukan, GET dilakukan kembali untuk memverifikasi perubahan. Response menunjukkan `price` sudah berubah dan `updated_at` kini terisi dengan timestamp terbaru — membuktikan mekanisme partial update menggunakan `exclude_unset=True` di `crud.py` berjalan dengan benar.

**Catatan Frontend:**
- Karena partial update didukung, form edit di frontend tidak perlu mengisi ulang semua field — cukup kirimkan field yang berubah.
- `updated_at` yang tadinya `null` kini memiliki nilai. Frontend perlu menampilkan ini dengan benar, misalnya "Terakhir diperbarui: 9 Maret 2026, 15:17 WIB".

---

### 6. DELETE `/items/{item_id}` — Delete Item

**Deskripsi:**
Endpoint untuk menghapus item dari database berdasarkan ID. Jika berhasil, server mengembalikan `204 No Content` tanpa response body.

**Parameter Path:**

| Parameter | Tipe | Wajib | Keterangan |
|-----------|------|-------|------------|
| `item_id` | integer | Ya | ID item yang akan dihapus |

**Request (hapus item ID: 4):**
```http
DELETE http://localhost:8000/items/4
Accept: */*
```

**Curl:**
```bash
curl -X 'DELETE' \
  'http://localhost:8000/items/4' \
  -H 'accept: */*'
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `204 No Content` |
| Server | uvicorn |

**Response Headers:**
```
access-control-allow-credentials: true
access-control-allow-origin: *
content-type: application/json
date: Mon, 09 Mar 2026 07:18:16 GMT
server: uvicorn
```

> Tidak ada response body — sesuai standar REST untuk operasi DELETE yang sukses.

**Verifikasi:** GET `/items/4` setelah DELETE menghasilkan `404 Not Found`, mengonfirmasi bahwa data sudah terhapus secara persisten dari PostgreSQL.

**Catatan Frontend:**
- Karena tidak ada response body, frontend harus mendeteksi keberhasilan DELETE hanya dari status code `204`.
- Setelah DELETE berhasil, frontend perlu memperbarui state lokal (misalnya menghapus item dari array state React) tanpa harus melakukan GET ulang ke seluruh list — ini lebih efisien.
- Disarankan menambahkan dialog konfirmasi di frontend sebelum mengirim request DELETE agar pengguna tidak menghapus item secara tidak sengaja.

---

### 7. GET `/items/stats` — Statistik Inventory

**Deskripsi:**
Endpoint untuk mendapatkan statistik agregat dari seluruh data inventaris yang ada. Tidak memerlukan parameter apapun.

**Request:**
```http
GET http://localhost:8000/items/stats
Accept: application/json
```

**Curl:**
```bash
curl -X 'GET' \
  'http://localhost:8000/items/stats' \
  -H 'accept: application/json'
```

**Hasil:**

| Field | Detail |
|-------|--------|
| Status Code | `200 OK` |
| Content-Type | `application/json` |
| Content-Length | 153 |
| Server | uvicorn |

**Response Body:**
```json
{
  "total_items": 4,
  "total_value": 14000000,
  "most_expensive": {
    "name": "Keyboard Mechanical",
    "price": 1200000
  },
  "cheapest": {
    "name": "Laptop",
    "price": 10000
  }
}
```

**Catatan — Temuan Routing Conflict (422 pada percobaan awal):**

Pada percobaan pertama, endpoint ini mengembalikan error `422 Unprocessable Entity` dengan detail:
```json
{
  "detail": [
    {
      "type": "int_parsing",
      "loc": ["path", "item_id"],
      "msg": "Input should be a valid integer, unable to parse string as an integer",
      "input": "stats"
    }
  ]
}
```

Error ini terjadi karena FastAPI mencocokkan path `/items/stats` dengan route `GET /items/{item_id}`, sehingga string `"stats"` diperlakukan sebagai nilai `item_id` yang seharusnya berupa integer. Ini adalah isu urutan definisi route — route statis (`/items/stats`) harus didefinisikan **sebelum** route dinamis (`/items/{item_id}`) di `main.py`. Setelah backend memperbaiki urutan tersebut, endpoint berjalan normal.

**Catatan Frontend:**
- Data dari endpoint ini sangat berguna untuk komponen **dashboard summary** — misalnya card yang menampilkan total item, total nilai inventaris, serta item termahal dan termurah.
- `total_value` merupakan hasil kalkulasi `sum(price × quantity)` dari seluruh item, bukan sekadar jumlah harga.
- Jika database kosong, response akan mengembalikan `total_items: 0`, `total_value: 0`, `most_expensive: null`, dan `cheapest: null` — frontend perlu menangani `null` agar tidak crash saat render.

---

## Rekap Hasil Pengujian

| No | Method | Endpoint | Skenario | Status Code | Hasil |
|----|--------|----------|----------|-------------|-------|
| 1 | GET | `/health` | Normal | 200 | ✅ Pass |
| 2 | POST | `/items` | Buat 3 item (Laptop, Mouse, Keyboard) | 201 | ✅ Pass |
| 3 | GET | `/items` | Tanpa filter | 200 | ✅ Pass |
| 4 | GET | `/items` | Dengan `search=laptop` | 200 | ✅ Pass |
| 5 | GET | `/items/{item_id}` | Item ditemukan (ID valid) | 200 | ✅ Pass |
| 6 | GET | `/items/{item_id}` | Item tidak ditemukan (ID tidak ada) | 404 | ✅ Pass |
| 7 | PUT | `/items/{item_id}` | Partial update (hanya `price`) | 200 | ✅ Pass |
| 8 | DELETE | `/items/{item_id}` | Hapus item | 204 | ✅ Pass |
| 9 | GET | `/items/{item_id}` | Verifikasi post-delete (harus 404) | 404 | ✅ Pass |
| 10 | GET | `/items/stats` | Statistik inventory | 200 | ✅ Pass |

**Seluruh endpoint berhasil diuji dan mengembalikan status code yang sesuai dengan spesifikasi modul.**

---

## Temuan & Observasi

### 1. CORS Terkonfigurasi dengan Benar
Header `access-control-allow-origin: *` dan `access-control-allow-credentials: true` tersedia pada response yang relevan. Ini berarti React frontend yang berjalan di `localhost:3000` (atau port lain) tidak akan mengalami isu CORS saat berkomunikasi dengan backend di `localhost:8000`.

### 2. Error Handling yang Informatif
Pesan error seperti `"Item dengan id=4 tidak ditemukan"` ditulis dalam Bahasa Indonesia dan cukup spesifik, sehingga dapat langsung digunakan sebagai pesan notifikasi di antarmuka pengguna tanpa perlu modifikasi tambahan di sisi frontend.

### 3. Partial Update Berjalan Sesuai Ekspektasi
Implementasi `exclude_unset=True` di `crud.py` memungkinkan frontend untuk hanya mengirimkan field yang berubah. Ini mengurangi payload request dan membuat form edit lebih fleksibel.

### 4. Routing Conflict pada `/items/stats`
Ditemukan konflik antara route statis `/items/stats` dan route dinamis `/items/{item_id}`. Ini adalah perilaku normal di FastAPI — urutan deklarasi route sangat menentukan. Temuan ini sudah dikomunikasikan ke Lead Backend dan diselesaikan dalam sesi yang sama.

### 5. Timestamp Menggunakan Timezone WIB (+08:00)
Seluruh timestamp (`created_at`, `updated_at`) sudah menyertakan informasi timezone `+08:00` yang sesuai dengan WIB. Frontend tidak perlu melakukan konversi timezone secara manual untuk pengguna di Indonesia.

---

## Catatan untuk Pengembangan Frontend (Pertemuan 3)

Berdasarkan hasil testing ini, berikut hal-hal yang perlu dipersiapkan saat membangun antarmuka React:

1. **State management untuk `null` values** — `updated_at` bisa bernilai `null`, begitu pula `most_expensive` dan `cheapest` di `/items/stats` jika database kosong.
2. **Pagination logic** — Gunakan field `total` dari `/items` untuk menghitung jumlah halaman: `totalPages = Math.ceil(total / limit)`.
3. **Penanganan status code eksplisit** — Terutama `404` untuk redirect dan `204` untuk konfirmasi DELETE tanpa membaca body response.
4. **Debounce pada fitur search** — Agar tidak mengirim request ke backend setiap kali pengguna mengetik satu karakter.
5. **Optimistic update** — Setelah DELETE, hapus item dari state lokal React daripada melakukan refetch seluruh list untuk pengalaman yang lebih responsif.