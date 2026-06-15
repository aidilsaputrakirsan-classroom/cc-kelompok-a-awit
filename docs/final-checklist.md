# Final Integration & Quality Assurance Checklist

Dokumen ini merupakan laporan status verifikasi QA terakhir yang dikerjakan sebelum rilis UAS (Milestone 3).

## 1. Verifikasi Repositori & Codebase
- [x] `README.md` memuat deskripsi proyek, diagram arsitektur, dan rincian anggota tim.
- [x] File `.env.example` telah mencakup seluruh *environment variables* yang dibutuhkan tanpa membocorkan kredensial.
- [x] File kredensial (`.env`, `test.db`) telah di-*ignore* dengan benar.
- [x] Tidak ditemukan password atau API key yang di-*hardcode* di dalam kode.
- [x] File-file tak terkait / usang (seperti PDF instruksi, `test.db`) telah dibersihkan.

## 2. Verifikasi Fitur Layanan (Integration Testing)
- [x] **API Gateway**: Dapat me-routing *request* ke Auth Service dan Item Service.
- [x] **Rate Limiting**: Memberikan status `HTTP 429 Too Many Requests` saat *request* login beruntun.
- [x] **Auth Service**: Endpoint `/auth/register` dan `/auth/login` berfungsi. Login mengembalikan JWT Token.
- [x] **Item Service**: Fitur CRUD berjalan dengan validasi. Proteksi *endpoint* dengan *token* diverifikasi oleh layanan otentikasi.
- [x] **Graceful Degradation**: Item Service tetap dapat merespons `GET /items` walau Auth Service di-*kill* sementara.

## 3. Observability & Monitoring
- [x] *Health checks* dari Gateway dan masing-masing layanan mikro lulus verifikasi.
- [x] Endpoint metrik (`/auth/metrics` & `/items/metrics`) memunculkan data berformat Prometheus/JSON yang memuat _Four Golden Signals_ (Latency, Traffic, Errors, Saturation).
- [x] Log yang dihasilkan oleh layanan-layanan telah memuat data dalam struktur JSON beserta `correlation_id` untuk kemudahan penelusuran error (*Tracing*).

## 4. Final Review Dokumentasi
- [x] **API Contract**: `api-contract-microservices.md` tersedia dan mencakup *schema*, *path*, dan ekspektasi JSON terkini.
- [x] **Release Notes**: `release-notes-m3.md` tersedia sebagai dokumentasi riwayat transisi menuju v3.0.0.
- [x] **Operations Guide**: `operations-guide.md` lengkap memuat *Troubleshooting* dan *Escalation Path* yang realistis.

> **Keputusan Akhir QA:** Proyek **LULUS** validasi Final Polish dan **SIAP** di-*merge* serta di-*tag* untuk rilis `v3.0.0` (UAS).
