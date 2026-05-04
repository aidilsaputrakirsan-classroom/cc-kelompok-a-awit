## Deskripsi
<!-- 
  Jelaskan secara singkat tujuan dari Pull Request ini.
  Contoh: "Menambahkan endpoint GET /health untuk memantau status seluruh services"
  Contoh: "Memperbaiki bug pada kalkulasi net_weight di halaman hauling"
-->

## Jenis Perubahan
- [ ] ✨ Fitur baru (feature)
- [ ] 🐛 Bug fix
- [ ] 📝 Dokumentasi
- [ ] ♻️ Refactoring
- [ ] 🔧 Konfigurasi / chore

## Komponen yang Terpengaruh
- [ ] 🖥️ Frontend (React + Vite)
- [ ] ⚙️ Backend (FastAPI)
- [ ] 🗄️ Database (PostgreSQL)
- [ ] 🐳 Docker / Infrastructure
- [ ] 🔁 CI/CD Pipeline
- [ ] 📄 Dokumentasi

## Detail Perubahan
<!-- 
  Jelaskan secara rinci perubahan yang dilakukan, termasuk:
  - File apa saja yang ditambah/diubah/dihapus
  - Alasan di balik perubahan tersebut
  - Dampak terhadap fitur atau komponen lain (jika ada)
  
  Contoh:
  - Menambahkan file `backend/main.py` dengan endpoint baru `/health`
  - Mengubah konfigurasi CORS di `docker-compose.yml`
  - Menghapus dependency yang tidak terpakai di `requirements.txt`
-->
-

## Cara Pengujian
<!-- 
  Tuliskan langkah-langkah untuk menguji perubahan ini secara lokal.
  Contoh:
  1. Jalankan `docker compose up --build -d`
  2. Buka http://localhost:8000/health untuk cek endpoint baru
  3. Pastikan response JSON berisi status "ok"
-->
1. Jalankan `docker compose up --build -d`
2. ...

## Screenshot / Bukti (jika ada)
<!-- 
  Lampirkan screenshot atau bukti pengujian yang relevan, seperti:
  - Screenshot tampilan UI sebelum dan sesudah perubahan
  - Screenshot response API dari Swagger (http://localhost:8000/docs) atau Postman
  - Screenshot hasil `docker compose ps` yang menunjukkan semua service berjalan
  - Screenshot terminal jika terkait perubahan DevOps/CI/CD
  
  Format: ![deskripsi](url_gambar)
-->

## Checklist
- [ ] Kode sudah di-review sendiri
- [ ] Tidak ada conflict dengan branch `main`
- [ ] Sudah ditest secara lokal
- [ ] Docker build berhasil tanpa error
- [ ] Dokumentasi sudah diperbarui (jika diperlukan)

## Catatan untuk Reviewer
<!-- 
  Tambahkan informasi penting yang perlu diketahui reviewer, seperti:
  - Bagian kode yang perlu perhatian khusus
  - Hal-hal yang belum selesai atau perlu ditindaklanjuti
  - Dependensi dengan PR lain (jika ada)
  - Pertanyaan atau keputusan teknis yang perlu didiskusikan
  
  Contoh: "Endpoint /health belum termasuk pengecekan koneksi ke PostgreSQL, 
  akan ditambahkan di PR berikutnya."
-->
