# CMS Company Profile

## Menjalankan Backend

Buka terminal pertama:

```powershell
cd "C:\docker\www\CMS-GOBANA COMPANY\backend"
npm install
npm start
```

Backend berjalan di:

```text
http://localhost:3000
```

Backend menggunakan Express + Sequelize dengan MySQL. Salin `backend/.env.example` ke `backend/.env`, lalu isi `DB_PASSWORD` dan konfigurasi database lokal sebelum menjalankan backend. Model untuk `about_us`, `categories`, `news`, `products`, `users`, dan `vendors` berada di `backend/src/models`.

Health check:

```text
http://localhost:3000/health
```

## Menjalankan Ionic Web

Buka terminal kedua:

```powershell
cd "C:\docker\www\CMS-GOBANA COMPANY\frontend"
npm install
npm start
```

Ionic Web berjalan di:

```text
http://localhost:4200
```

Backend dan Ionic Web dijalankan bersamaan menggunakan dua terminal terpisah.

## Dokumentasi Sistem

- [Flowchart sistem dan hak akses](FLOWCHART.md)
- [Konteks untuk AI Agent](ai.md)
