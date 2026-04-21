# API Documentation

Dokumentasi lengkap untuk REST API aplikasi PalmTrack Cloud (PalmChain). API ini menggunakan FastAPI dan berjalan di `http://localhost:8000` secara default.

## Base URL
```
http://localhost:8000
```

## Authentication
**Tidak diperlukan** - Semua endpoint dapat diakses tanpa authentication.

## Response Format
Semua response menggunakan JSON format.

## Error Response
```json
{
  "detail": "Error message description"
}
```

---

## Endpoints

### 1. Health Check

**GET** `/health`

**Description:** Mengecek status kesehatan API server.

**Request Body:** None

**Response:**
```json
{
  "status": "healthy",
  "version": "0.2.0"
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X GET "http://localhost:8000/health"
```

---

### 2. Create Item

**POST** `/items`

**Description:** Membuat item baru dalam inventory.

**Request Body:**
```json
{
  "name": "Laptop Gaming",
  "description": "Laptop untuk gaming",
  "price": 15000000,
  "quantity": 5
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Laptop Gaming",
  "description": "Laptop untuk gaming",
  "price": 15000000,
  "quantity": 5,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X POST "http://localhost:8000/items" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Laptop Gaming",
       "description": "Laptop untuk gaming",
       "price": 15000000,
       "quantity": 5
     }'
```

---

### 3. List Items

**GET** `/items`

**Description:** Mengambil daftar items dengan pagination dan search.

**Query Parameters:**
- `skip` (integer, optional): Jumlah data yang di-skip (default: 0)
- `limit` (integer, optional): Jumlah data per halaman (default: 20, max: 100)
- `search` (string, optional): Kata kunci pencarian berdasarkan nama/deskripsi

**Request Body:** None

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Laptop Gaming",
      "description": "Laptop untuk gaming",
      "price": 15000000,
      "quantity": 5,
      "created_at": "2024-01-01T10:00:00",
      "updated_at": "2024-01-01T10:00:00"
    }
  ],
  "total": 1
}
```

**Auth Required:** No

**Curl Example:**
```bash
# Get all items
curl -X GET "http://localhost:8000/items"

# With pagination
curl -X GET "http://localhost:8000/items?skip=0&limit=10"

# With search
curl -X GET "http://localhost:8000/items?search=laptop"
```

---

### 4. Get Item Stats

**GET** `/items/stats`

**Description:** Mengambil statistik inventory (total items, total value, item termahal, termurah).

**Request Body:** None

**Response:**
```json
{
  "total_items": 5,
  "total_value": 75000000,
  "most_expensive": {
    "name": "Laptop Gaming",
    "price": 15000000
  },
  "cheapest": {
    "name": "Mouse",
    "price": 50000
  }
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X GET "http://localhost:8000/items/stats"
```

---

### 5. Get Single Item

**GET** `/items/{item_id}`

**Description:** Mengambil detail satu item berdasarkan ID.

**Path Parameters:**
- `item_id` (integer): ID item yang ingin diambil

**Request Body:** None

**Response:**
```json
{
  "id": 1,
  "name": "Laptop Gaming",
  "description": "Laptop untuk gaming",
  "price": 15000000,
  "quantity": 5,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X GET "http://localhost:8000/items/1"
```

---

### 6. Update Item

**PUT** `/items/{item_id}`

**Description:** Update item berdasarkan ID (partial update).

**Path Parameters:**
- `item_id` (integer): ID item yang ingin diupdate

**Request Body:** (hanya field yang ingin diupdate)
```json
{
  "name": "Laptop Gaming Updated",
  "price": 16000000
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Laptop Gaming Updated",
  "description": "Laptop untuk gaming",
  "price": 16000000,
  "quantity": 5,
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00"
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X PUT "http://localhost:8000/items/1" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Laptop Gaming Updated",
       "price": 16000000
     }'
```

---

### 7. Delete Item

**DELETE** `/items/{item_id}`

**Description:** Menghapus item berdasarkan ID.

**Path Parameters:**
- `item_id` (integer): ID item yang ingin dihapus

**Request Body:** None

**Response:** No content (204)

**Auth Required:** No

**Curl Example:**
```bash
curl -X DELETE "http://localhost:8000/items/1"
```

---

### 8. Team Info

**GET** `/team`

**Description:** Mengambil informasi anggota tim.

**Request Body:** None

**Response:**
```json
{
  "team": "cloud-team-a-awit",
  "members": [
    {
      "name": "Adam Ibnu Ramadhan",
      "nim": "10231003",
      "role": "Lead Backend"
    },
    {
      "name": "Alfian Fadillah Putra",
      "nim": "10231009",
      "role": "Lead Frontend"
    },
    {
      "name": "Varrel Kaleb Ropard Pasaribu",
      "nim": "10231089",
      "role": "Lead Container"
    },
    {
      "name": "Adhyasta Firdaus",
      "nim": "10231005",
      "role": "Lead CI/CD & Deploy"
    },
    {
      "name": "Adonia Azarya Tamalonggehe",
      "nim": "10231007",
      "role": "Lead QA & Docs"
    }
  ]
}
```

**Auth Required:** No

**Curl Example:**
```bash
curl -X GET "http://localhost:8000/team"
```

---

## Interactive Documentation

Untuk dokumentasi interaktif dengan kemampuan testing, kunjungi:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Notes

- Semua endpoint mendukung CORS untuk frontend
- Error handling menggunakan HTTP status codes standar
- Database menggunakan SQLAlchemy ORM
- Pagination menggunakan `skip` dan `limit` parameters