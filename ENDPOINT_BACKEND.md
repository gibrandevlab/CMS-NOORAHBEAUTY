# Endpoint Backend

Dokumentasi lengkap seluruh REST API endpoint untuk backend CMS Company Profile & Katalog Jasa (PT Gibran / CMS Gobana Company).

- **Base URL**: `http://localhost:3000/api`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (Khusus Rute Admin)

---

## 1. Autentikasi (`/api/auth`)

### Login Admin
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Auth**: None
- **Body JSON**:
  ```json
  {
    "username": "ADMIN",
    "password": "your_password"
  }
  ```
- **Response Success (200)**:
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 1,
      "username": "ADMIN",
      "email": "admin@ptgibran.com"
    }
  }
  ```

---

## 2. Public Guest Routes (`/api/public`)

Endpoint publik read-only tanpa memerlukan token autentikasi.

| Resource | Method | URL | Keterangan |
|---|---|---|---|
| **Profil Toko** | `GET` | `/api/public/about` | Ambil data profil perusahaan |
| **Kategori** | `GET` | `/api/public/categories?type=NEWS\|PRODUCT` | Filter kategori berdasarkan tipe |
| **Katalog Produk** | `GET` | `/api/public/products?category_id=1&is_active=true` | Ambil daftar produk aktif |
| **Detail Produk** | `GET` | `/api/public/products/:idOrSlug` | Detail produk via ID atau Slug |
| **Daftar Berita** | `GET` | `/api/public/news?category_id=1&is_published=true` | Ambil berita yang terbit |
| **Detail Berita** | `GET` | `/api/public/news/:idOrSlug` | Detail berita via ID atau Slug |
| **Daftar Vendor** | `GET` | `/api/public/vendors` | Ambil daftar vendor mitra |

---

## 3. CRUD Kategori (`/api/categories` & `/api/admin/categories`)

Manage kategori jasa & berita.

### 1. Ambil Semua Kategori
- **Method**: `GET`
- **URL**: `/api/categories` atau `/api/admin/categories`
- **Query Params**: `?type=NEWS` atau `?type=PRODUCT` (opsional)

### 2. Detail Kategori
- **Method**: `GET`
- **URL**: `/api/categories/:id`

### 3. Tambah Kategori
- **Method**: `POST`
- **URL**: `/api/categories` atau `/api/admin/categories`
- **Body JSON**:
  ```json
  {
    "name": "Jasa Konstruksi",
    "slug": "jasa-konstruksi",
    "type": "PRODUCT"
  }
  ```
  *Keterangan*: `type` bernilai `"NEWS"` atau `"PRODUCT"`. jika `slug` kosong, akan dibuatkan otomatis.

### 4. Update Kategori
- **Method**: `PUT`
- **URL**: `/api/categories/:id`
- **Body JSON**:
  ```json
  {
    "name": "Jasa Renovasi & Konstruksi",
    "type": "PRODUCT"
  }
  ```

### 5. Hapus Kategori
- **Method**: `DELETE`
- **URL**: `/api/categories/:id`

---

## 4. CRUD Produk / Jasa (`/api/products` & `/api/admin/products`)

Manage produk dan layanan perusahaan.

### 1. Ambil Semua Produk
- **Method**: `GET`
- **URL**: `/api/products` atau `/api/admin/products`
- **Query Params**: `?category_id=1&is_active=true`

### 2. Detail Produk
- **Method**: `GET`
- **URL**: `/api/products/:idOrSlug`

### 3. Tambah Produk Baru
- **Method**: `POST`
- **URL**: `/api/products` atau `/api/admin/products`
- **Body JSON**:
  ```json
  {
    "category_id": 1,
    "name": "Jasa Desain Arsitektur",
    "slug": "jasa-desain-arsitektur",
    "description": "Layanan desain interior & eksterior profesional.",
    "price": 15000000.00,
    "image": "/uploads/desain-1.jpg",
    "is_active": true
  }
  ```

### 4. Update Produk
- **Method**: `PUT`
- **URL**: `/api/products/:id`
- **Body JSON**:
  ```json
  {
    "price": 17500000.00,
    "is_active": true
  }
  ```

### 5. Hapus Produk
- **Method**: `DELETE`
- **URL**: `/api/products/:id`

---

## 5. CRUD Berita (`/api/news` & `/api/admin/news`)

Manage berita & artikel perusahaan.

### 1. Ambil Semua Berita
- **Method**: `GET`
- **URL**: `/api/news` atau `/api/admin/news`
- **Query Params**: `?category_id=1&is_published=true`

### 2. Detail Berita
- **Method**: `GET`
- **URL**: `/api/news/:idOrSlug`

### 3. Tambah Berita Baru
- **Method**: `POST`
- **URL**: `/api/news` atau `/api/admin/news`
- **Body JSON**:
  ```json
  {
    "category_id": 2,
    "title": "Peresmian Proyek Baru PT Gibran",
    "slug": "peresmian-proyek-baru-pt-gibran",
    "content": "<p>PT Gibran meresmikan proyek pembangunan gedung baru...</p>",
    "image": "/uploads/berita-1.jpg",
    "is_published": true
  }
  ```

### 4. Update Berita
- **Method**: `PUT`
- **URL**: `/api/news/:id`
- **Body JSON**:
  ```json
  {
    "title": "Peresmian Proyek Baru & Kerjasama PT Gibran",
    "is_published": true
  }
  ```

### 5. Hapus Berita
- **Method**: `DELETE`
- **URL**: `/api/news/:id`

---

## 6. CRUD Vendor (`/api/vendors` & `/api/admin/vendors`)

Manage mitra vendor perusahaan.

### 1. Ambil Semua Vendor
- **Method**: `GET`
- **URL**: `/api/vendors` atau `/api/admin/vendors`

### 2. Detail Vendor
- **Method**: `GET`
- **URL**: `/api/vendors/:id`

### 3. Tambah Vendor Baru
- **Method**: `POST`
- **URL**: `/api/vendors` atau `/api/admin/vendors`
- **Body JSON**:
  ```json
  {
    "name": "PT Semen Perkasa",
    "logo": "/uploads/vendor-semen.png",
    "address": "Jl. Industri No. 45, Jakarta",
    "contact": "081234567890"
  }
  ```

### 4. Update Vendor
- **Method**: `PUT`
- **URL**: `/api/vendors/:id`
- **Body JSON**:
  ```json
  {
    "contact": "081987654321"
  }
  ```

### 5. Hapus Vendor
- **Method**: `DELETE`
- **URL**: `/api/vendors/:id`

---

## 7. Profile Perusahaan (`/api/about` & `/api/admin/about`)

Manage informasi tentang kami / profil perusahaan.

### 1. Ambil Profil Perusahaan
- **Method**: `GET`
- **URL**: `/api/about` atau `/api/admin/about`

### 2. Update Profil Perusahaan
- **Method**: `PUT`
- **URL**: `/api/about` atau `/api/admin/about`
- **Body JSON**:
  ```json
  {
    "company_name": "PT Gibran Utama",
    "description": "Perusahaan penyedia jasa profesional dan produk berkualitas.",
    "vision": "Menjadi perusahaan konstruksi & jasa terdepan.",
    "mission": "Memberikan pelayanan terbaik bagi mitra dan konsumen.",
    "address": "Jl. Jendral Sudirman No. 100, Jakarta",
    "phone": "021-5551234",
    "email": "info@ptgibran.com"
  }
  ```

---

## 8. Admin Dashboard Stats (`/api/admin/dashboard/stats`)

- **Method**: `GET`
- **URL**: `/api/admin/dashboard/stats`
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "totalCategories": 5,
      "totalNews": 12,
      "totalProducts": 8,
      "totalVendors": 4
    }
  }
  ```

---

## 9. Kode HTTP Response Standard

- `200 OK`: Request berhasil dieksekusi.
- `201 Created`: Data baru berhasil dibuat.
- `400 Bad Request`: Validasi inputan gagal (contoh: field wajib belum diisi, format email/harga salah, slug duplikat).
- `401 Unauthorized`: Token JWT tidak valid atau kredensial login salah.
- `404 Not Found`: Data ID / Slug yang dicari tidak ditemukan di database.
- `500 Internal Server Error`: Server atau database error.
