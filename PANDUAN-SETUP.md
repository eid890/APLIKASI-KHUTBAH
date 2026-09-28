# Panduan Setup — Jadwal Khotbah Jumat v6

Hanya ada **2 file** yang dipakai:

| File | Ditaruh di mana |
|---|---|
| `Kode.gs` | Editor Google Apps Script (backend + database) |
| `index.html` | Repository GitHub → otomatis tayang di Vercel |

Tidak perlu Firebase, tidak perlu environment variable.

---

## Tahap 1 — Apps Script & database (±10 menit)

1. Buka **https://script.google.com** → **Proyek baru**.
   (Boleh juga dari dalam Google Sheets: **Ekstensi → Apps Script**. Keduanya sekarang sama-sama jalan.)
2. Hapus semua isi `Kode.gs`, lalu tempel seluruh isi file **`Kode.gs`** dari paket ini. Tekan **Ctrl+S**.
3. Di bilah atas, pilih fungsi **`setupDatabase`** → klik **▶ Jalankan**.
4. Muncul permintaan izin:
   **Tinjau izin → pilih akun Google → Lanjutan → Buka (tidak aman) → Izinkan.**
   Peringatan "tidak aman" itu normal untuk skrip buatan sendiri.
5. Buka **Log eksekusi** di bawah. Anda akan melihat:
   - link spreadsheet database yang baru dibuat (sheet `khotib`, `masjid`, `jadwal`)
   - **PIN admin: 123456**

   Mau mencoba dengan data contoh? Jalankan juga fungsi **`isiDataContoh`**.

## Tahap 2 — Terbitkan sebagai aplikasi web (±3 menit)

1. Klik **Deploy → Deployment baru**.
2. Ikon roda gigi di "Pilih jenis" → **Aplikasi web**.
3. Isi:
   - **Jalankan sebagai:** Saya
   - **Yang memiliki akses:** Siapa saja
4. Klik **Deploy**, lalu salin **URL aplikasi web** — bentuknya
   `https://script.google.com/macros/s/AKfy..../exec`
5. Tes: buka URL itu di browser. Harus muncul
   `{"ok":true,"message":"API Jadwal Khotbah aktif",...}`

> **PENTING — setiap kali mengubah Kode.gs:** klik **Deploy → Kelola deployment → ikon pensil → Versi: Versi baru → Deploy**. Kalau tidak, server tetap menjalankan kode lama. URL-nya tidak berubah.

## Tahap 3 — GitHub (±5 menit, tanpa perlu instal Git)

1. Masuk **github.com** → **New repository** → nama `jadwal-khotbah` → **Create repository**.
2. Klik **uploading an existing file** → seret `index.html` → **Commit changes**.

*Opsional tapi disarankan:* sebelum upload, buka `index.html` dengan Notepad, cari baris

```js
API_URL: ''
```

lalu isi dengan URL `/exec` Anda, misal `API_URL: 'https://script.google.com/macros/s/AKfy.../exec'`.
Dengan begitu, semua perangkat langsung terhubung dan cukup memasukkan PIN.

## Tahap 4 — Vercel (±3 menit)

1. Masuk **vercel.com** dengan akun GitHub.
2. **Add New → Project** → pilih repo `jadwal-khotbah` → **Import**.
3. Framework Preset: **Other**. Tidak ada yang perlu diisi lagi → **Deploy**.
4. Selesai. Alamat aplikasi misalnya `https://jadwal-khotbah.vercel.app`.

Setiap kali Anda meng-upload `index.html` baru ke GitHub, Vercel memperbarui situs otomatis dalam ±30 detik.

## Tahap 5 — Pemakaian pertama

1. Buka alamat Vercel → tempel URL `/exec` (jika belum diisi di kode) → masukkan PIN `123456` → **Masuk**.
2. **Pengaturan → Ganti PIN** — segera ganti PIN default.
3. Isi data **Masjid** dan **Khotib** (atau langsung ketik di Google Sheets juga boleh, lalu klik **Muat ulang**).
4. **Rotasi otomatis** → pilih tanggal mulai & jumlah pekan → **Buat pratinjau** → periksa/ganti bila perlu → **Simpan semua**.
5. **Cetak** → pilih Jumat atau bulan → **Unduh PNG** untuk dibagikan ke grup WA.

---

## Mengatasi masalah

| Pesan | Penyebab & solusi |
|---|---|
| `Cannot read properties of null (reading 'getId')` | Anda masih memakai kode lama. Tempel ulang `Kode.gs` versi 6. |
| "Database belum di-setup" | Jalankan `setupDatabase` di editor Apps Script. |
| "Server tidak mengembalikan data" | Akses deployment belum "Siapa saja", atau URL berakhiran `/dev`. Pakai URL `/exec`. |
| Perubahan kode tidak berpengaruh | Belum membuat **Versi baru** di Kelola deployment. |
| Lupa PIN | Di editor, jalankan `lihatPIN` (lihat log) atau `resetPIN` (kembali ke 123456). |
| "Terlalu banyak percobaan PIN salah" | Tunggu 10 menit. |
| Spreadsheet database terhapus | Jalankan `resetKoneksiDatabase`, lalu `setupDatabase`. |

## Catatan pengelolaan data

- Google Sheets boleh diedit langsung, tetapi **jangan ubah baris judul** (baris 1) dan **jangan ubah kolom `id`**.
- Khotib yang sedang safar/sakit: ubah status menjadi **Tidak aktif** — riwayatnya tetap aman dan ia tidak masuk rotasi.
- Cadangan: di Google Sheets, **File → Histori versi** menyimpan semua perubahan otomatis.
