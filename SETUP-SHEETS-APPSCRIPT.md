# 🚀 TUTORIAL SETUP - Google Sheets + Apps Script + Vercel

## 📋 Apa yang akan kita setup

```
Google Sheet (Database)
    ↓ (backend: Apps Script)
Google Apps Script (API)
    ↓ (frontend: HTML/JS)
Vercel (Hosting)
    ↓ (version control)
GitHub
```

**Total waktu: ~45 menit**

---

## FASE 1: SETUP GOOGLE SHEETS + APPS SCRIPT (20 menit)

### Step 1: Buat Google Sheet

1. Buka https://sheets.google.com
2. Klik **"+"** untuk buat spreadsheet baru
3. Beri nama: `Jadwal Khotbah Jumat`
4. Jangan lupa di-share ke admin (biar bisa diakses nanti)

✅ Sheet terbuat

---

### Step 2: Buka Apps Script Editor

1. Di Google Sheet, klik **Tools** → **<> Script Editor**
2. Tab baru akan terbuka (Google Apps Script)
3. Delete semua kode yang ada (template default)

✅ Script editor siap

---

### Step 3: Copy-Paste Kode Apps Script

1. Copy kode dari file: `apps-script.gs`
2. Paste ke Script Editor
3. Klik **Save** (Ctrl+S)

✅ Kode tersimpan

---

### Step 4: Run Setup Database

1. Di Script Editor, pilih function: **setupDatabase** (dropdown atas)
2. Klik **Play** (icon ▶)
3. Authorize: Klik "Review permissions" → "Allow"
4. Tunggu selesai (lihat console)

✅ Database sheets otomatis terbuat!

Sekarang check di Google Sheet Anda:
- Sheet "khotib" (dengan dummy data)
- Sheet "masjid" (dengan dummy data)
- Sheet "jadwal" (dengan dummy data)

---

### Step 5: Deploy as Web App

1. Klik **Deploy** button (atas kanan)
2. Pilih **"New deployment"**
3. Type: **"Web app"**
4. Settings:
   - Execute as: **"Me"** ← Important!
   - Who has access: **"Anyone"**
5. Klik **"Deploy"**

✅ Deployment berhasil! 

Sekarang copy deployment URL yang muncul:
```
https://script.google.com/macros/d/{SCRIPT_ID}/usercalc
```

Simpan URL ini, nanti dipakai di aplikasi frontend.

---

## FASE 2: UPLOAD KE GITHUB (15 menit)

### Step 1: Buat GitHub Account & Repository

(Skip jika sudah ada)

1. Buka https://github.com
2. Login (atau buat account)
3. Buat repository baru:
   - Nama: `jadwal-khotbah`
   - Public atau Private
   - Init dengan README

✅ Repository terbuat

---

### Step 2: Upload Aplikasi Frontend

Di repository, buat file:

**File 1: `index.html`**
- Copy kode dari: `index-sheets.html`
- Paste di GitHub (Create new file → index.html)

**File 2: `README.md`**
```markdown
# Jadwal Khotbah Jumat

Aplikasi manajemen jadwal khotbah dengan Google Sheets + Vercel

## Setup

1. Buka aplikasi di Vercel
2. Paste deployment URL dari Google Apps Script
3. Klik "Save URL"
4. Siap digunakan!

## Tech Stack

- Frontend: HTML + JS
- Database: Google Sheets
- Backend: Google Apps Script
- Hosting: Vercel
```

✅ File sudah di GitHub

---

## FASE 3: DEPLOY KE VERCEL (15 menit)

### Step 1: Buat Vercel Account

1. Buka https://vercel.com
2. Klik "Sign Up" → "Continue with GitHub"
3. Authorize

✅ Vercel account terbuat

---

### Step 2: Import Repository

1. Di Vercel Dashboard, klik **"New Project"**
2. Pilih repository: `jadwal-khotbah`
3. Klik **"Import"**
4. Settings:
   - Framework: `Other` (Static Site)
   - Root Directory: `.`
5. Klik **"Deploy"**

Tunggu ~1-2 menit...

✅ Vercel deploy selesai!

Sekarang copy live URL (misal: `https://jadwal-khotbah.vercel.app`)

---

## FASE 4: TESTING & KONFIGURASI (10 menit)

### Step 1: Buka Aplikasi Live

1. Buka URL dari Vercel
2. Lihat setup panel di atas

### Step 2: Paste Google Apps Script URL

1. Copy deployment URL dari Apps Script (dari Step 5 Fase 1)
2. Paste di input "Deployment URL"
3. Klik **"Save URL"**

✅ URL tersimpan di localStorage

---

### Step 3: Test Koneksi

1. Jika berhasil, akan muncul: **"✅ Koneksi berhasil!"**
2. Data dari Google Sheets otomatis muncul di aplikasi
3. Coba tambah khotib, masjid, jadwal
4. Check di Google Sheet → data otomatis tersimpan ✅

---

## 🎯 WORKFLOW NANTINYA

```
1. Edit aplikasi di GitHub
2. Push ke GitHub
3. Vercel auto-deploy
4. Website update (karena static site)
5. Apps Script connect ke Google Sheets
6. Semua data otomatis tersimpan ✅
```

---

## 📝 FILE SUMMARY

| File | Fungsi | Lokasi |
|------|--------|--------|
| `apps-script.gs` | Backend (Google Apps Script) | Google Sheet → Apps Script Editor |
| `index-sheets.html` | Frontend (aplikasi) | GitHub + Vercel |
| `README.md` | Dokumentasi | GitHub |

---

## 🔑 KUNCI SETUP

1. **Google Sheet** = Database
   - Sheets: khotib, masjid, jadwal
   - Auto-create via Apps Script

2. **Google Apps Script** = API
   - Handle GET/POST requests
   - Read/write ke Google Sheets
   - Deployed as Web App

3. **Frontend (HTML)** = Interface
   - Call Apps Script API
   - Display & input data
   - Hosted di Vercel

4. **GitHub** = Version Control
   - Track changes
   - Vercel auto-deploy

---

## ✅ CHECKLIST SETUP

Fase 1: Google Sheets + Apps Script
- [ ] Google Sheet dibuat
- [ ] Apps Script kode di-paste
- [ ] setupDatabase() di-run
- [ ] Sheets (khotib, masjid, jadwal) terbuat
- [ ] Apps Script di-deploy as Web App
- [ ] Deployment URL di-copy

Fase 2: GitHub
- [ ] GitHub account siap
- [ ] Repository dibuat
- [ ] index.html di-upload
- [ ] README.md di-upload

Fase 3: Vercel
- [ ] Vercel account siap
- [ ] Repository di-import
- [ ] Deploy selesai
- [ ] Live URL di-copy

Fase 4: Testing
- [ ] Buka aplikasi live
- [ ] Paste Apps Script URL
- [ ] Test tambah khotib
- [ ] Check data di Google Sheet
- [ ] Semua bekerja ✅

---

## 🆘 TROUBLESHOOTING

### ❌ "Koneksi gagal"

**Masalah:** Apps Script URL salah

**Solusi:**
1. Buka Google Sheet
2. Tools → Script Editor
3. Deploy → lihat URL terbaru
4. Copy & paste ulang

---

### ❌ "Data tidak muncul"

**Masalah:** Apps Script belum di-run setupDatabase()

**Solusi:**
1. Buka Google Sheet
2. Tools → Script Editor
3. Pilih function: `setupDatabase`
4. Klik Play
5. Tunggu selesai

---

### ❌ "Error 403"

**Masalah:** Permission error di Apps Script

**Solusi:**
1. Buka Google Sheet
2. Tools → Script Editor
3. Klik Deploy
4. Edit deployment
5. "Who has access": ubah ke **"Anyone"**

---

## 🎓 LEARNING POINTS

Anda sekarang sudah tahu:

1. ✅ **Google Sheets** sebagai database (familiar untuk Indonesia)
2. ✅ **Google Apps Script** sebagai backend (serverless)
3. ✅ **Frontend HTML+JS** untuk UI (Vercel)
4. ✅ **GitHub** untuk version control
5. ✅ **API communication** (frontend ↔ Apps Script)

---

## 📊 PERBANDINGAN SETUP

| Aspek | Sebelum (v4.2) | Sekarang (Sheets) |
|-------|---|---|
| Database | LocalStorage | Google Sheets |
| Backend | Tidak ada | Google Apps Script |
| Deployment | Manual | Vercel auto-deploy |
| Version Control | Tidak ada | GitHub |
| Scalability | Single device | Cloud + multi-device |
| Backup | Manual | Google Sheets auto-backup |

---

## 💡 TIPS

1. **Backup Google Sheet** regularly
   - File → Download → .xlsx

2. **Monitor Apps Script quotas**
   - Google Apps Script punya free quotas
   - Cek: Script Editor → Resources → Quotas

3. **Share Google Sheet** dengan koordinator
   - Mereka bisa lihat data real-time
   - Bisa edit langsung di Sheets

4. **Update aplikasi**
   - Edit di GitHub
   - Auto-deploy ke Vercel
   - Beres!

---

## 🚀 NEXT STEPS

1. **Sekarang:** Follow tutorial ini step-by-step
2. **Testing:** Jangan lupa test semua fitur
3. **Production:** Share live URL ke users
4. **Maintain:** Backup data regularly

---

## 📞 QUICK REFERENCE

```
Setup checklist:
[ ] Sheet + Apps Script setup
[ ] Apps Script URL copy
[ ] GitHub repo buat
[ ] index.html upload
[ ] Vercel deploy
[ ] URL connect ke Apps Script
[ ] Test semua fitur
[ ] GO LIVE! 🎉
```

---

**Total waktu: ~45 menit**

**Hasilnya: Production-ready aplikasi dengan Google Sheets + Vercel!** 🚀

Siap dimulai? Buka Google Sheets sekarang! 💪
