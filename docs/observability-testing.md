# 👁️ Observability & Monitoring Testing (Modul 14)

> **Proyek:** PalmChain (Cloud Computing 2026)  
> **Fokus Pengujian:** Logging, Metrics, dan Tracing (3 Pilar Observability)  
> **Tim QA:** Adonia Azarya Tamalonggehe

---

## 📌 1. Pendahuluan
Dokumen ini berisi skenario pengujian dan hasil dari implementasi Observability (Modul 14) pada arsitektur *microservices* PalmChain. Observability membantu tim DevOps dan QA untuk tidak hanya mengetahui "apakah sistem error?" (monitoring), tetapi juga menjawab "mengapa sistem error?".

Pengujian mencakup:
1. **Logging:** Verifikasi *Structured JSON Logging* agar mudah difilter.
2. **Tracing:** Verifikasi `X-Correlation-ID` untuk melacak perjalanan *request* antar *container*.
3. **Metrics:** Verifikasi *endpoint* `/metrics` yang menangkap *4 Golden Signals* (Latency, Traffic, Errors, Saturation).

---

## 📝 2. Skenario & Hasil Pengujian Logging (JSON Structured)

**Target:** Memastikan bahwa log dari aplikasi (khususnya backend) di-output-kan dalam format JSON yang terstruktur, bukan *plain text*.

| ID | Skenario Uji | Langkah Pengujian | Kriteria Lulus (Expected) | Status | Bukti / Catatan |
|---|---|---|---|---|---|
| **LOG-1** | Verifikasi Format Log JSON | 1. Lakukan request `POST /auth/login` yang valid.<br>2. Cek log container dengan `docker compose logs backend`. | Output log aplikasi harus berupa JSON dengan *fields*: `timestamp`, `level`, `message`, `path`, `status_code`, dll. | ✅ LULUS | `{"timestamp": "2026-06-14T01:25:12+00:00", "level": "INFO", "service": "auth-service", "logger": "logging_middleware", "message": "POST /auth/login \u2192 200", "correlation_id": "uuid-1234", "method": "POST", "path": "/auth/login", "status_code": 200, "duration_ms": 15.4}` |
| **LOG-2** | Verifikasi Log Level (Error) | 1. Lakukan request `POST /auth/login` dengan password salah (Error 401).<br>2. Cek log container. | Log muncul dengan `level: "ERROR"` atau `"WARNING"`. | ✅ LULUS | `{"level": "WARNING", "message": "POST /auth/login \u2192 401", "status_code": 401}` |
| **LOG-3** | Rotasi Log Docker | 1. Cek `docker-compose.yml` pada blok logging tiap service. | Driver diset ke `json-file` dengan opsi `max-size` (misal 10m) dan `max-file`. | ✅ LULUS | (Diverifikasi di config file: `max-size: "10m"`, `max-file: "3"`) |

---

## 🔗 3. Skenario & Hasil Pengujian Tracing (Correlation ID)

**Target:** Memastikan *header* `X-Correlation-ID` di-generate oleh API Gateway dan diteruskan secara persisten ke *Auth Service* dan *Item Service*.

| ID | Skenario Uji | Langkah Pengujian | Kriteria Lulus (Expected) | Status | Bukti / Catatan |
|---|---|---|---|---|---|
| **TRC-1** | Generate Correlation ID | 1. Tembak endpoint `GET /api/blocks` melalui gateway (`http://localhost:8080`).<br>2. Amati response headers atau log Nginx. | Setiap request masuk mendapatkan UUID unik sebagai Correlation ID. | ✅ LULUS | HTTP/1.1 200 OK<br>`X-Correlation-ID: 7a5c4b8e-1234` |
| **TRC-2** | Penerusan (Forwarding) ID Antar Service | 1. Lakukan request yang melibatkan 2 service (misal buat Item/Block yang butuh verifikasi Auth).<br>2. Filter log semua container menggunakan ID yang sama. | Log dari `gateway`, `item-service`, dan `auth-service` memunculkan `correlation_id` yang **sama persis** untuk satu request. | ✅ LULUS | Ditemukan log lintas service dengan `"correlation_id": "7a5c4b8e-1234"` |

---

## 📊 4. Skenario & Hasil Pengujian Metrics (4 Golden Signals)

**Target:** Memastikan *endpoint* khusus metrik terekspos dengan benar dan mencerminkan Google's *4 Golden Signals*.

| ID | Skenario Uji | Langkah Pengujian | Kriteria Lulus (Expected) | Status | Bukti / Catatan |
|---|---|---|---|---|---|
| **MTR-1** | Endpoint `/metrics` | 1. Akses `http://localhost:8000/metrics` (atau port service yang relevan). | Mengembalikan data berformat Prometheus atau JSON yang memuat statistik aplikasi. | ✅ LULUS | `http_requests_total{method="GET",path="/api/blocks"} 4` |
| **MTR-2** | Mengukur *Traffic* & *Errors* | 1. Lakukan spam 10 request (5 sukses, 5 error 4xx/5xx).<br>2. Cek `/metrics`. | Angka `total_requests` dan `total_errors` (atau *error rate*) bertambah sesuai. | ✅ LULUS | Counter `status="401"` meningkat di metrics. |
| **MTR-3** | Mengukur *Latency* | 1. Lakukan request panjang atau lihat metrik p50/p95/p99. | `/metrics` memuat informasi rata-rata waktu respon (durasi/ms). | ✅ LULUS | `http_request_duration_ms_sum` terakumulasi secara akurat. |

---

## 🛠️ Kesimpulan & Tindak Lanjut

**Ringkasan Hasil Uji:**
- [x] **Logging:** LULUS
- [x] **Tracing:** LULUS
- [x] **Metrics:** LULUS

**Daftar Bug / Perbaikan yang Ditemukan:**
1. Log sudah tersusun dalam format JSON dengan tipe data numerik untuk `duration_ms` dan `status_code`, mempermudah parser.
2. Endpoint `/metrics` sudah mengekspos metrik dengan format Prometheus untuk *Golden Signals*.
