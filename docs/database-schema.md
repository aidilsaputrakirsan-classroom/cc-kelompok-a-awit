# Database Schema

Skema database untuk proyek ini terdiri dari satu tabel utama `items` yang menyimpan inventaris.

## Tabel `items`

| Kolom       | Tipe Data           | Properti / Keterangan                  |
|-------------|---------------------|----------------------------------------|
| `id`        | INTEGER             | Primary key, auto-increment, indexed   |
| `name`      | VARCHAR(100)        | Not null, indexed                      |
| `description`| TEXT               | Nullable                               |
| `price`     | FLOAT               | Not null                               |
| `quantity`  | INTEGER             | Not null, default 0                    |
| `created_at`| DATETIME(timezone)  | Server default NOW()                   |
| `updated_at`| DATETIME(timezone)  | On update CURRENT_TIMESTAMP            |

### Penjelasan

- **Primary key**: kolom `id` bertindak sebagai identifier unik untuk setiap item.
- **Index**: kolom `name` diindeks untuk mempercepat pencarian berdasarkan nama.
- **Defaults**: `quantity` default-nya 0, sehingga saat item baru dibuat tanpa kuantitas eksplisit, nilainya nol.
- **Timestamps**: `created_at` dicatat saat baris dibuat; `updated_at` otomatis diisi ketika baris diubah.
