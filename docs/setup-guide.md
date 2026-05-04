# ⚙️ DevOps Setup Guide — PalmTrack Cloud

## 📌 Deskripsi

Dokumen ini berisi panduan lengkap untuk menjalankan project **PalmTrack Cloud** dari awal hingga berhasil berjalan di local environment.

Panduan ini ditujukan untuk:
- Anggota tim baru
- Pengguna yang belum pernah melihat project ini
- Siapapun yang ingin menjalankan project tanpa error

---

## 🧰 Prerequisites

Pastikan sudah menginstall:

| Tools | Versi Minimum |
|------|--------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ |
| Git | terbaru |

Cek dengan:

```bash
python --version
node --version
npm --version
psql --version
git --version
```

---

## 📥 1. Clone Repository

```bash
git clone https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-a-awit.git
cd cc-kelompok-a-awit
```

---

## 🐘 2. Setup Database PostgreSQL

Masuk ke PostgreSQL:

```bash
psql -U postgres
```

Buat database:

```sql
CREATE DATABASE emandor;
```

---

## ⚙️ 3. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

### a. Buat Virtual Environment

```bash
python -m venv venv
```

### b. Aktifkan Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

---

### c. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### d. Setup Environment Variables

Copy file template:

```bash
copy .env.example .env
```

atau

```bash
cp .env.example .env
```

Edit file `.env`:

```env
DATABASE_URL=postgresql://postgres:1@localhost:5432/emandor

# JWT
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

---

### e. Jalankan Backend

```bash
uvicorn main:app --reload --port 8000
```

Cek di browser:

- http://localhost:8000
- http://localhost:8000/docs

---

## 🎨 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
```

### a. Install Dependencies

```bash
npm install
```

---

### b. Setup Environment

```bash
copy .env.example .env
```

atau

```bash
cp .env.example .env
```

Isi:

```env
VITE_API_URL=http://localhost:8000
```

---

### c. Jalankan Frontend

```bash
npm run dev
```

Buka:

http://localhost:5173

---

## 🔄 5. Verifikasi Aplikasi

Pastikan:

- Backend berjalan di port 8000  
- Frontend berjalan di port 5173  
- API terkoneksi  
- CRUD berjalan normal  

---

## 🛠️ Troubleshooting

### Backend tidak connect ke database

- Pastikan PostgreSQL aktif
- DATABASE_URL benar
- Database sudah dibuat

---

### Frontend tidak connect ke backend

- Backend harus running
- Cek VITE_API_URL

---

## 🚀 Alternatif Setup

```bash
bash setup.sh
```

---

## 📚 Kesimpulan

Dengan mengikuti panduan ini, project dapat dijalankan dari nol dengan environment yang konsisten dan minim error.
