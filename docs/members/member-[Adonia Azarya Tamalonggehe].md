# Reflection Paper UAS Cloud Computing — Lead QA & Docs
**Nama:** Adonia Azarya Tamalonggehe  
**Role:** Lead Quality Assurance & Documentation  
**Proyek:** PalmTrack Cloud (Kelompok A)  

---

## 1. Pendahuluan dan Tanggung Jawab Peran
Sebagai *Lead Quality Assurance* (QA) & *Documentation* dalam proyek PalmTrack Cloud, tanggung jawab utama saya berfokus pada dua pilar esensial dalam siklus pengembangan: penjaminan kualitas sistem dan pengelolaan dokumentasi teknis sebagai *single source of truth*.

Secara berkesinambungan dari Modul 1 hingga Modul 15, peran saya menuntut koordinasi erat dengan seluruh lini pengembangan. Mulai dari merancang skenario uji UI (antarmuka), memvalidasi kelulusan *Continuous Integration* (CI), hingga menyusun panduan operasional *Microservices* dan *System Health Observability*.

## 2. Kontribusi Utama dalam Proyek

### Fase Monolith & Persiapan UTS (Modul 1 – 7)
Pada paruh pertama proyek, fokus saya adalah membangun fondasi pengujian dan pemahaman arsitektur awal (*Dockerized Monolith*):
*   **Penyusunan Hasil Uji Fungsional:** Mengeksekusi pengujian *Blackbox* (CRUD Vendor & Blok) dan mendokumentasikannya ke dalam `ui-test-results.md` (Modul 3).
*   **Analisis Optimalisasi Container:** Melakukan riset dan pengujian komparatif ukuran *Docker Image* (`python:3.12` vs `slim` vs `alpine`) dan menyusun temuan tersebut di `image-comparison.md` (Modul 5).
*   **Dokumentasi Arsitektur Awal:** Menyusun diagram awal *3-container setup* (`docker-architecture.md`) serta merancang naskah demonstrasi langkah-demi-langkah (`uts-demo-script.md`) untuk meminimalkan risiko kegagalan *live demo* UTS.

### Fase Microservices, CI/CD, & Observability (Modul 8 – 15)
Seiring dengan pemecahan sistem menjadi *Microservices*, kompleksitas pengujian meningkat tajam. Kontribusi saya mencakup:
*   **Penyusunan Panduan Pengujian & Operasional:** Saya menulis standarisasi *testing* tim (`testing-guide.md`), serta membuat pedoman operasional pemantauan sistem (`operations-guide.md`) yang mencakup cara membaca *Structured JSON Logging* dan *Metrics* (Modul 10 & 14).
*   **Pengawalan Transisi Arsitektur:** Memelihara `microservices-architecture.md` dan kontrak API lintas layanan (`api-contract-microservices.md`) agar komunikasi data antara *Auth Service* dan *Item Service* tetap tersinkronisasi.
*   **Evaluasi Keandalan Sistem (Resilience):** Mendokumentasikan hasil pengujian fitur *Circuit Breaker* dan toleransi kegagalan (*Graceful Degradation*) di dalam `reliability-testing.md`.
*   **Penjaminan Mutu Final Rilis:** Menerbitkan `release-notes-m3.md` dan memverifikasi *Four Golden Signals* pada *dashboard* `/status` sebelum mengeluarkan `final-checklist.md` sebagai lampu hijau bahwa aplikasi layak masuk ke *Production*.

## 3. Analisis Keputusan Teknis dan Tantangan QA

### A. Pengujian Integrasi Lintas-Layanan (Microservices)
**Tantangan:** Awalnya, melacak letak kesalahan (*bug*) sangat sulit karena satu *request* klien harus melewati *API Gateway (Nginx)*, divalidasi oleh *Auth Service*, lalu diproses oleh *Item Service*. Seringkali *error* terjadi di tengah jalan tanpa jejak yang jelas.
**Analisis & Solusi:** Saya mendorong tim untuk memanfaatkan secara penuh fitur *Correlation ID* (Modul 14). Sebagai QA, keputusan teknis saya adalah menjadikan *Correlation ID* sebagai metrik wajib dalam setiap pengujian. Saya memvalidasi log di *terminal* untuk memastikan ID yang sama direkam di seluruh layanan, sehingga pelacakan *bug* menjadi jauh lebih cepat dan terukur.

### B. Miskonsepsi Lingkungan Pengujian (CI vs Production)
**Tantangan:** Terjadi fenomena di mana *Pipeline* CI (GitHub Actions) berstatus hijau/lulus, namun sistem gagal berjalan di *Production URL* (Railway).
**Analisis & Solusi:** Setelah dianalisis, hal ini terjadi karena CI menggunakan *SQLite in-memory* (sesuai anjuran modul untuk mempercepat *build*), sementara *Production* menuntut koneksi konstan ke *PostgreSQL*. Saya menyusun panduan agar setiap *Pull Request* yang krusial tidak hanya lolos CI, tetapi juga harus melalui *sanity check* secara lokal menggunakan *Docker Compose* ber-PostgreSQL asli sebelum di-*merge*.

## 4. Pembelajaran dan Refleksi Pribadi
Selama proyek PalmTrack Cloud berjalan, saya menyadari bahwa masih banyak hal yang seharusnya bisa saya maksimalkan sejak awal. Namun, dari ketidaksempurnaan tersebut, saya memetik wawasan yang sangat berharga:

*   **Paradigma Baru QA di Era Cloud:** Saya belajar bahwa peran QA di ranah *Cloud Computing* bukan cuma mengeklik tombol aplikasi di *browser*. QA dituntut untuk terjun langsung memantau arsitektur *server*, menganalisis beban *Rate Limiting*, dan memantau metrik kesehatan sistem (*Four Golden Signals*).
*   **Kolaborasi Lintas Peran (Shift-Left Testing):** QA tidak bisa bekerja terisolasi di akhir rantai pengembangan. Koordinasi erat dengan *Lead DevOps* dan *Backend* di tahap awal rancangan (sebelum kode ditulis) adalah kunci untuk menyepakati format respons *error* dan mencegah regresi.
*   **Keandalan vs Kesempurnaan:** Saya menyadari bahwa membangun aplikasi yang 100% bebas *bug* adalah kemustahilan. Yang terpenting adalah membangun sistem yang *resilient*—bagaimana aplikasi dapat menangani kegagalan secara anggun (*graceful degradation*) tanpa membuat panik pengguna.
