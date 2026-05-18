# Panduan Testing & CI (Continuous Integration)

Dokumen ini berisi panduan untuk melakukan *automated testing* pada proyek PalmTrack Cloud, baik secara lokal maupun membaca hasil CI/CD di GitHub Actions.

---

## 1. Menjalankan Test Secara Lokal

Sebelum membuat Pull Request (PR), sangat disarankan untuk menjalankan test secara lokal guna memastikan kode tidak merusak fitur yang sudah ada.

### A. Backend (Pytest)

Backend menggunakan **pytest** untuk unit testing.

1. Buka terminal dan masuk ke folder backend:
   ```bash
   cd backend
   ```
2. Pastikan virtual environment aktif:
   ```bash
   # Windows
   .venv\Scripts\activate
   ```
3. Jalankan test:
   ```bash
   pytest
   
   # Untuk melihat output log yang lebih detail (verbose):
   pytest -v
   ```

### B. Frontend (Vitest)

Frontend menggunakan **Vitest** (karena kita menggunakan Vite sebagai bundler) dan **React Testing Library**.

1. Buka terminal dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Jalankan test:
   ```bash
   npm run test
   
   # Untuk mode watch (otomatis run saat file di-save):
   npm run test:watch
   ```

---

## 2. Cara Menambahkan Test Baru

Setiap fitur baru wajib memiliki test minimal (unit test/integration test).

### A. Tambah Test Backend
- File test backend diletakkan di dalam folder `backend/tests/`.
- Nama file wajib berawalan `test_` (contoh: `test_contractor.py`).
- Nama fungsi di dalam file juga wajib berawalan `test_`.

Contoh sederhana:
```python
def test_create_contractor(client):
    response = client.post("/api/contractors", json={"name": "PT Sawit Maju"})
    assert response.status_code == 201
    assert response.json()["name"] == "PT Sawit Maju"
```

### B. Tambah Test Frontend
- File test frontend diletakkan berdekatan dengan komponen atau di dalam folder `__tests__/`.
- Gunakan ekstensi `.test.jsx` atau `.spec.jsx`.

Contoh sederhana:
```jsx
import { render, screen } from '@testing-library/react';
import Header from '../Header';

test('renders app title', () => {
  render(<Header />);
  const titleElement = screen.getByText(/PalmTrack Cloud/i);
  expect(titleElement).toBeInTheDocument();
});
```

---

## 3. Cara Membaca CI Log (GitHub Actions)

Saat Anda membuat Pull Request, GitHub Actions akan otomatis menjalankan CI pipeline (Linter & Tests).

1. Buka halaman Pull Request Anda di GitHub.
2. Scroll ke bagian paling bawah, cari bagian **Checks**.
3. Jika statusnya **❌ (merah / failed)**, klik tombol **Details** di sebelah kanan.
4. Anda akan diarahkan ke halaman log GitHub Actions.
5. Klik pada **Job** yang gagal (misal: `test-backend` atau `test-frontend`).
6. Scroll ke baris yang ditandai merah untuk melihat pesan error yang spesifik.

---

## 4. Cara Debugging Test Failure

Jika CI gagal, ikuti langkah berikut untuk memperbaikinya:

1. **Replikasi secara lokal:** Jangan mencoba memperbaiki kode dengan menebak-nebak dan langsung commit. Jalankan test yang gagal secara lokal di laptop Anda menggunakan cara pada bagian 1.
2. **Fokus pada 1 file test:** Jika gagal di banyak tempat, jalankan 1 file test saja secara spesifik:
   ```bash
   pytest tests/test_nama_file.py
   # atau
   npm run test test_nama_file.test.jsx
   ```
3. **Cek Linting:** Terkadang CI gagal bukan karena logic, tapi karena kode tidak rapi (linting). Jalankan linter lokal:
   ```bash
   # Backend
   ruff check .
   
   # Frontend
   npm run lint
   ```
4. Setelah test berhasil secara lokal (passed), lakukan `git add`, `git commit`, dan `git push`. GitHub Actions akan secara otomatis menjalankan ulang (re-run) checks pada PR Anda.
