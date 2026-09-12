# 📐 DESIGN.md — Comprehensive System & Technical Specification

> **Project Name:** CMS & Portfolio Web Noorah Beauty MUA  
> **Brand Target:** Noorah Beauty MUA & Hairdo Semarang (`noorahbeauty_mua`)  
> **Version:** 1.0.0 (Production Ready)  
> **Document Status:** Approved Architecture Standard  
> **Core Architecture:** Decoupled/Monolithic RESTful API + Admin Dashboard & Public Storefront  

---

## 1. Executive Summary & Business Context

### 1.1 Business Overview
Noorah Beauty MUA adalah penyedia jasa kecantikan berbasis di Semarang yang berfokus pada layanan *Makeup Artist (MUA)*, *Hairdo*, *Photoshoot Styling*, serta penjualan produk kustom *Press-on Nails*. 

### 1.2 System Purpose
Sistem Content Management System (CMS) ini dirancang untuk:
1. Mempublikasikan katalog layanan (*Makeup*, *Hairdo*, *Photoshoot*) dan katalog produk fisik (*Custom Press-on Nails*).
2. Mempublikasikan artikel edukasi (*Beauty Tips & Care Guide*), *Portofolio Showcase* (BTS/Hasil Project), serta *Promo/Pengumuman*.
3. Menyediakan halaman Admin Panel berbasis peran (RBAC) untuk mengelola seluruh konten master data dan informasi profil toko.
4. Memfasilitasi konversi calon klien langsung ke saluran komunikasi utama (WhatsApp Business).

---

## 2. Technical Stack & Dependencies

### 2.1 Environment & Database
* **Database Engine:** MySQL 8.0.x
* **Database Name:** `db_pt_gibran`
* **Character Set:** `utf8mb4` / `utf8mb4_0900_ai_ci`
* **Server Timezone:** UTC (`+00:00`)

### 2.2 Backend Architecture (Node.js REST API)
* **Runtime:** Node.js (v18+ LTS)
* **Framework:** Express.js
* **Database Driver / ORM:** `mysql2` (dengan Query Builder/Sequelize/Prisma sesuai konfigurasi)
* **Core Dependencies:**
  * `dotenv` (Environment Config Management)
  * `cors` (Cross-Origin Resource Sharing)
  * `jsonwebtoken` (JWT Authentication for Protected Endpoints)
  * `bcryptjs` (Password Hashing with Salt Rounds = 10)
  * `multer` (Multipart Form-Data & File Upload Handling)
  * `slugify` (Automated SEO Friendly URL Generation)

### 2.3 Frontend & UI Specification
* **Admin Interface:** AdminLTE 3.x (Protected Dashboard Engine)
* **Public Interface:** Responsive Web Storefront (Aesthetic Dark Elegance Theme)

---

## 3. Database Schema & Data Integrity Contract

Seluruh struktur entitas mengacu pada skema SQL fisik `db_pt_gibran`:

+------------------+         +------------------+
|    categories    |         |     about_us     |
+------------------+         +------------------+
| id (PK)          |<---+    | id (PK)          |
| name             |    |    | company_name     |
| slug (UQ)        |    |    | description      |
| type (ENUM)      |    |    | vision / mission |
| created_at       |    |    | address / phone  |
| updated_at       |    |    | email / update_at|
+------------------+    |    +------------------+
|   |            |
|   +-----------------------+
|                |          |
v (1:N)          v (1:N)    |
+------------------+ +------------------+ +------------------+
|       news       | |     products     | |      users       |
+------------------+ +------------------+ +------------------+
| id (PK)          | | id (PK)          | | id (PK)          |
| category_id (FK)-+ | category_id (FK)-+ | username (UQ)    |
| title / slug (UQ)| | name / slug (UQ) | | email (UQ)       |
| content / image  | | description      | | password (hash)  |
| is_published     | | price / image    | | created_at       |
| created_at       | | is_active        | | updated_at       |
| updated_at       | | created/updated  | +------------------+
+------------------+ +------------------+


### 3.1 Entity Specifications

#### A. Table `about_us` (Company & Store Profile)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `company_name`: `VARCHAR(255)`, Not Null, Default: `'PT Gibran'` (Representasi Sistem: `'Noorah Beauty MUA'`).
* `description`: `LONGTEXT`, Nullable (Bio & Tagline: *"Your beauty partner"*).
* `vision`: `TEXT`, Nullable.
* `mission`: `TEXT`, Nullable.
* `address`: `TEXT`, Nullable (Lokasi Operasional: Semarang, Jawa Tengah).
* `phone`: `VARCHAR(50)`, Nullable (Nomor Kontak WhatsApp: `6285869187340`).
* `email`: `VARCHAR(100)`, Nullable.
* `updated_at`: `TIMESTAMP`, Nullable, Auto-update on modification.

#### B. Table `categories` (Taxonomy Engine)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `name`: `VARCHAR(100)`, Not Null.
* `slug`: `VARCHAR(255)`, Unique, Not Null.
* `type`: `ENUM('NEWS', 'PRODUCT')`, Not Null, Default: `'NEWS'`.
  * `type = 'PRODUCT'`: Membawahi kategori layanan/produk (contoh: *Makeup*, *Hairdo*, *Custom Press-on Nails*, *Photoshoot*).
  * `type = 'NEWS'`: Membawahi kategori konten (contoh: *Beauty Tips & Care*, *Portofolio Showcase*, *Promo & Announcements*).
* `created_at`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.
* `updated_at`: `TIMESTAMP`, Auto-update on modification.

#### C. Table `news` (Content & Showcase Engine)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `category_id`: `INT`, Foreign Key ke `categories.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`).
* `title`: `VARCHAR(255)`, Not Null.
* `slug`: `VARCHAR(255)`, Unique, Not Null (Auto-generated dari `title`).
* `content`: `LONGTEXT`, Not Null (Mendukung format Rich Text / HTML).
* `image`: `VARCHAR(255)`, Nullable (Path direktori gambar publik).
* `is_published`: `TINYINT(1)`, Not Null, Default: `1` (1 = Dipublikasikan, 0 = Draf). Indexed: `idx_news_published`.
* `created_at`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.
* `updated_at`: `TIMESTAMP`, Auto-update on modification.

#### D. Table `products` (Catalog & Service Engine)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `category_id`: `INT`, Foreign Key ke `categories.id` (`ON DELETE RESTRICT ON UPDATE CASCADE`).
* `name`: `VARCHAR(255)`, Not Null.
* `slug`: `VARCHAR(255)`, Unique, Not Null (Auto-generated dari `name`).
* `description`: `TEXT`, Nullable.
* `price`: `DECIMAL(15,2)`, Default: `0.00`.
* `image`: `VARCHAR(255)`, Nullable.
* `is_active`: `TINYINT(1)`, Not Null, Default: `1` (1 = Aktif, 0 = Nonaktif). Indexed: `idx_products_active`.
* `created_at`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.
* `updated_at`: `TIMESTAMP`, Auto-update on modification.

#### E. Table `users` (Admin Authentication)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `username`: `VARCHAR(50)`, Unique, Not Null.
* `email`: `VARCHAR(100)`, Unique, Not Null.
* `password`: `VARCHAR(255)`, Not Null (Must be Bcrypt Hashed).
* `created_at`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.
* `updated_at`: `TIMESTAMP`, Auto-update on modification.

#### F. Table `vendors` (Partner Management)
* `id`: `INT`, Primary Key, Auto Increment, Not Null.
* `name`: `VARCHAR(255)`, Not Null.
* `logo`: `VARCHAR(255)`, Nullable.
* `address`: `TEXT`, Nullable.
* `contact`: `VARCHAR(100)`, Nullable.
* `created_at`: `TIMESTAMP`, Default `CURRENT_TIMESTAMP`.
* `updated_at`: `TIMESTAMP`, Auto-update on modification.

---

## 4. Security, Authentication & File Lifecycle

### 4.1 Seed Credential Standard (Initial Deployment)
* **Username:** `ADMIN`
* **Email:** `admin@ptgibran.com`
* **Plain Password:** `admin123`
* **Hashing Specification:** `Bcrypt` with `SaltRounds = 10`

### 4.2 Route Protection & Authorization Standard
1. **Public Routes (No Auth Required):**
   * `GET /api/public/about`
   * `GET /api/public/categories`
   * `GET /api/public/products` & `/api/public/products/:slug`
   * `GET /api/public/news` & `/api/public/news/:slug`
   * `GET /api/public/vendors`

2. **Protected Admin Routes (Mandatory JWT Middleware):**
   * Semuanya membutuhkan HTTP Request Header:  
     `Authorization: Bearer <JWT_TOKEN>`
   * `POST /api/auth/login` (Public, mengembalikan signed JWT Token).
   * `POST /api/auth/logout` (Invalidasi token di tingkat klien/state).
   * `ALL /api/admin/*` (CRUD Kategori, Berita/Portofolio, Produk, Vendor, & Update Profile).

### 4.3 Upload & File Storage Protocol
* **Middleware Engine:** `multer`
* **Storage Location:** Directory `public/uploads/` atau `storage/uploads/`
* **Validation Rules:**
  * Allowed MIME Types: `image/png`, `image/jpeg`, `image/jpg`
  * Max File Size: `2,097,152 Bytes` (2 MB)
* **File Cleanup Contract (Lifecycle Event):**
  * Ketika endpoint `DELETE` dipanggil pada entitas `news`, `products`, atau `vendors`, controller **WAJIB** mengeksekusi panggilan asynchronous `fs.unlink()` untuk menghapus berkas fisik gambar terkait dari server disk storage.

---

## 5. UI/UX & Visual Design Specification

### 5.1 Color Palette & Theme Engine
Design System mengusung estetika *Beauty Dark Elegance & Rose Luxury*:
* **Primary Background (Public):** `#121212` (Rich Obsidian Dark)
* **Surface Background (Cards/Modals):** `#1E1E1E` (Elevated Charcoal)
* **Accent / Brand Color:** `#B76E79` (Rose Gold) / `#E8D8CE` (Warm Beige)
* **Text Primary:** `#FFFFFF` (Pure White)
* **Text Secondary:** `#A0A0A0` (Muted Silver)
* **Status Badges (AdminLTE):**
  * Active/Published: `bg-success` (`#28a745`)
  * Draft/Inactive: `bg-warning` (`#ffc107`)
  * Delete/Danger: `bg-danger` (`#dc3545`)

### 5.2 Admin Dashboard Layout (AdminLTE 3)
* **Sidebar Menu Items:**
  1. 📊 **Dashboard** (`/admin/dashboard`)
  2. 🏷️ **Kategori Master** (`/admin/categories`)
  3. 📦 **Katalog Produk & Layanan** (`/admin/products`)
  4. 📰 **Artikel & Portofolio** (`/admin/news`)
  5. 🏢 **Daftar Vendor** (`/admin/vendors`)
  6. ℹ️ **Profil Toko** (`/admin/about-us`)
* **Dashboard Widgets (MVP Counters):**
  * Card 1: `Total Artikel / Portofolio` (Query: `SELECT COUNT(*) FROM news`)
  * Card 2: `Total Produk / Layanan` (Query: `SELECT COUNT(*) FROM products`)
  * Card 3: `Total Kategori` (Query: `SELECT COUNT(*) FROM categories`)
  * Card 4: `Total Vendor Partner` (Query: `SELECT COUNT(*) FROM vendors`)

### 5.3 Public Storefront Layout (Client-Facing)
1. **Header & Hero Section:**
   * Display Avatar/Logo Noorah Beauty MUA.
   * Store Name: "Noorah Beauty MUA".
   * Description: "Your beauty partner — MUA & Hairdo Semarang".
   * Direct CTA Button: "Book via WhatsApp" (`https://wa.me/6285869187340`).
2. **Highlights Navigation Bar:**
   * Kategori Showcase: *Makeup*, *Hairdo*, *Custom Press-on Nails*, *Birthday*, *Photoshoot*, *Review/Testimoni*.
3. **Instagram-Style Portfolio Grid:**
   * Layout Grid 3-Column Responsive (seperti feed Instagram pada referensi aset).
   * Hover Overlay menampilkan Judul Project / Portofolio dari tabel `news`.
4. **Product Catalog Section:**
   * Grid Card Produk *Custom Press-on Nails* & Layanan MUA (gambar, nama, harga terformat `Rp XX.XXX`, tombol konsultasi).
5. **Beauty Blog & Tips Section:**
   * Artikel edukasi dari `news` dengan kategori tipe `'NEWS'`.

---

## 6. Implementation Guidelines for AI Agents

Saat menggenerasikan kode (backend controller, route, model, maupun frontend component), AI Agent **HARUS** mematuhi instruksi teknis berikut:

1. **Slugs Generation:** Selalu gunakan package `slugify` dengan opsi `{ lower: true, strict: true }` pada atribut `title` (`news`) dan `name` (`products` & `categories`).
2. **Password Security:** Selalu gunakan `bcrypt.hash(password, 10)` sebelum memasukkan atau memperbarui record pengguna di tabel `users`.
3. **Strict Validation:** Pastikan setiap endpoint pembuatan/pembaruan data memeriksa keberadaan field `NOT NULL` sesuai skema database SQL.
4. **REST API JSON Response Format:**
   * Success: `{ "status": "success", "message": "...", "data": { ... } }`
   * Error: `{ "status": "error", "message": "...", "errors": [ ... ] }`