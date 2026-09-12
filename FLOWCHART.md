# Flowchart Sistem CMS (Public & Admin) - PT Gibran / CMS Gobana Company

Dokumen ini memvisualisasikan alur sistem CMS secara transparan dan terstruktur dengan memisahkan 3 lapisan utama:
1. **Tampilan (Frontend / UI)**: Halaman, Komponen, Router Angular/Ionic.
2. **Sistem (App Logic / Middleware)**: State, Interceptor, Guard, Express Router, dan Middleware.
3. **Backend (Controller, Model & Storage)**: Express Controller, Sequelize ORM, Database MySQL (`db_pt_gibran`), serta Storage Uploads.

---

## 1. Flowchart Rute User Public (Guest)

Visualisasi alur pengguna publik yang mengakses profil perusahaan, berita, katalog produk/jasa, dan kontak WhatsApp.

```mermaid
flowchart TD
    subgraph UI["1. TAMPILAN (Frontend / UI)"]
        U1([Guest Akses Website]) --> U2["Route: /beranda\n(BerandaPage)"]
        U2 --> U3{"User Memilih Navigasi"}
        U3 -->|Lihat Katalog Jasa| U4["Route: /katalog-jasa\n(KatalogJasaPage)"]
        U3 -->|Lihat Berita| U5["Route: /berita\n(BeritaPage)"]
        U3 -->|Klik Detail Produk| U6["Route: /katalog-jasa/:slug\n(ProductDetailPage)"]
        U3 -->|Klik Detail Berita| U7["Route: /berita/:slug\n(NewsDetailPage)"]
        U3 -->|Klik WhatsApp| U8["Redirect External:\nhttps://wa.me/62..."]
    end

    subgraph SYS["2. SISTEM (App Logic & Route Handler)"]
        S1["PublicService.getAbout()"]
        S2["PublicService.getProducts(filter)"]
        S3["PublicService.getNews(filter)"]
        S4["PublicService.getProductBySlug(slug)"]
        S5["PublicService.getNewsBySlug(slug)"]
        
        S_ROUTER["Express Public Router\n(Tanpa Auth Middleware)"]
    end

    subgraph BE["3. BACKEND (Controller, Model & DB)"]
        B1["AboutController.getAbout"]
        B2["ProductController.getPublicProducts"]
        B3["NewsController.getPublicNews"]
        B4["ProductController.getBySlug"]
        B5["NewsController.getBySlug"]

        DB_ABOUT[("MySQL: about_us")]
        DB_PROD[("MySQL: products\n(is_active = true)")]
        DB_NEWS[("MySQL: news\n(is_published = true)")]
        DB_CAT[("MySQL: categories")]
        DB_VEN[("MySQL: vendors")]
    end

    %% Flow Connections
    U2 -->|HTTP GET /api/public/about| S1
    U2 -->|HTTP GET /api/public/vendors| S_ROUTER
    U4 -->|HTTP GET /api/public/products| S2
    U5 -->|HTTP GET /api/public/news| S3
    U6 -->|HTTP GET /api/public/products/:slug| S4
    U7 -->|HTTP GET /api/public/news/:slug| S5

    S1 --> S_ROUTER
    S2 --> S_ROUTER
    S3 --> S_ROUTER
    S4 --> S_ROUTER
    S5 --> S_ROUTER

    S_ROUTER -->|GET /api/public/about| B1
    S_ROUTER -->|GET /api/public/products| B2
    S_ROUTER -->|GET /api/public/news| B3
    S_ROUTER -->|GET /api/public/products/:slug| B4
    S_ROUTER -->|GET /api/public/news/:slug| B5

    B1 --> DB_ABOUT
    B2 --> DB_PROD & DB_CAT
    B3 --> DB_NEWS & DB_CAT
    B4 --> DB_PROD
    B5 --> DB_NEWS

    DB_ABOUT -->|Return Profil| U2
    DB_PROD -->|Return Catalog Data| U4
    DB_NEWS -->|Return News Data| U5
    DB_PROD -->|Return Detail Product| U6
    DB_NEWS -->|Return Detail News| U7
```

---

## 2. Flowchart Autentikasi & Proteksi Admin

Visualisasi alur login, penerbitan JWT token, proteksi rute Angular `AuthGuard`, dan verifikasi header `Authorization: Bearer <token>` oleh `authMiddleware`.

```mermaid
flowchart TD
    subgraph UI["1. TAMPILAN (Frontend UI)"]
        A1([Admin Membuka CMS]) --> A2["Route: /login\n(LoginPage)"]
        A2 --> A3["Input Form Username & Password"]
        A3 --> A4["Submit Form Login"]
        A8["Alert: Login Gagal (Pesan Error)"]
        A9["Redirect to: /admin/dashboard\n(AdminLayoutComponent)"]
    end

    subgraph SYS["2. SISTEM (App Logic & Security Middleware)"]
        S1["AuthService.login(username, password)"]
        S2["JwtInterceptor\n(Attach Bearer Token ke Header)"]
        S3["AuthGuard\n(Cek Token Exists & Valid)"]
        S_AUTH_MW["authMiddleware.js\n(jwt.verify Bearer Token)"]
    end

    subgraph BE["3. BACKEND (Controller, Auth Service & DB)"]
        B1["AuthController.login"]
        B2["Find User in Database"]
        B3{"User ADA?"}
        B4["Bcrypt.compare(password, hash)"]
        B5{"Password COCOK?"}
        B6["JWT Sign (Payload: id, username)"]
        B7["Return 401 Unauthorized"]
        
        DB_USER[("MySQL: users")]
    end

    %% Connections
    A4 -->|HTTP POST /api/auth/login| S1
    S1 --> B1
    B1 --> B2 --> DB_USER
    DB_USER --> B3
    B3 -->|Tidak| B7 --> A8
    B3 -->|Ya| B4
    B4 --> B5
    B5 -->|Tidak| B7
    B5 -->|Ya| B6
    B6 -->|Response 200 + JWT Token| S1
    S1 -->|Simpan Token di LocalStorage/State| A9

    %% Route Protection Flow
    A9 -->|Navigasi Rute /admin/*| S3
    S3 -->|Valid| S2
    S3 -->|Invalid / No Token| A2
    S2 -->|Request API Admin + Header Auth| S_AUTH_MW
    S_AUTH_MW -->|Token Valid| B8["Proses Controller Admin"]
    S_AUTH_MW -->|Token Expiration/Invalid| B9["Response 401 / 403"] --> A2
```

---

## 3. Flowchart Rute Admin & Pengelolaan CMS (Dashboard & CRUD)

Visualisasi alur Admin saat mengelola Dashboard, Kategori, Produk/Jasa, Berita, Vendor, dan Profil Perusahaan beserta handler Upload File Gambar (Multer).

```mermaid
flowchart TD
    subgraph UI["1. TAMPILAN (Frontend UI Admin)"]
        D1["Route: /admin/dashboard\n(DashboardPage)"]
        D2["Route: /admin/kategori-jasa\n(KategoriJasaPage)"]
        D3["Route: /admin/jasa\n(JasaPage - CRUD Produk/Jasa)"]
        D4["Route: /admin/berita\n(BeritaPage - CRUD Berita)"]
        D5["Route: /admin/vendor\n(VendorPage - CRUD Vendor)"]
        D6["Route: /admin/tentang-kami\n(TentangKamiPage - Profil)"]
        D7["Modal Form (Tambah / Edit Data)"]
        D8["Upload Input (<input type='file'>)"]
        D9["Tombol Logout"]
    end

    subgraph SYS["2. SISTEM (App Logic & Middleware)"]
        S_HTTP["HttpClient + JwtInterceptor\n(Authorization: Bearer JWT)"]
        S_GUARD["authMiddleware.js\n(Verifikasi JWT Token)"]
        S_MULTER["Multer Upload Middleware\n- Validasi Extension (.png, .jpg, .jpeg)\n- Validasi File Size (Max 2MB)"]
        S_VAL["Validation Logic\n(Required Fields, Slugify)"]
    end

    subgraph BE["3. BACKEND (Controller, File Storage & Database)"]
        C_DASH["DashboardController.getStats"]
        C_CAT["CategoryController (CRUD)"]
        C_PROD["ProductController (CRUD)"]
        C_NEWS["NewsController (CRUD)"]
        C_VEN["VendorController (CRUD)"]
        C_ABOUT["AboutController.update"]

        STOR["Physical File Storage\n(/storage/uploads)"]
        FS_UNLINK["fs.unlink()\n(Hapus gambar saat Delete record)"]

        DB_ALL[("MySQL Database db_pt_gibran\n(categories, products, news, vendors, about_us)")]
    end

    %% UI to System
    D1 -->|GET /api/admin/dashboard/stats| S_HTTP
    D2 -->|GET/POST/PUT/DELETE /api/admin/categories| S_HTTP
    D3 -->|Multipart Form POST/PUT /api/admin/products| S_HTTP
    D4 -->|Multipart Form POST/PUT /api/admin/news| S_HTTP
    D5 -->|Multipart Form POST/PUT /api/admin/vendors| S_HTTP
    D6 -->|PUT /api/admin/about| S_HTTP
    D9 -->|Clear JWT Storage| LOGIN["Redirect /login"]

    %% System to Backend
    S_HTTP --> S_GUARD
    S_GUARD --> S_VAL

    D3 & D4 & D5 -->|File Image Included| S_MULTER
    S_MULTER -->|Save File Physical| STOR
    S_MULTER -->|Pass File Path| S_VAL

    S_VAL -->|Stats Req| C_DASH
    S_VAL -->|Category Req| C_CAT
    S_VAL -->|Product Req| C_PROD
    S_VAL -->|News Req| C_NEWS
    S_VAL -->|Vendor Req| C_VEN
    S_VAL -->|About Req| C_ABOUT

    %% Backend to DB & Storage
    C_DASH -->|COUNT queries| DB_ALL
    C_CAT -->|INSERT/UPDATE/DELETE| DB_ALL
    C_PROD -->|INSERT/UPDATE/DELETE| DB_ALL
    C_NEWS -->|INSERT/UPDATE/DELETE| DB_ALL
    C_VEN -->|INSERT/UPDATE/DELETE| DB_ALL
    C_ABOUT -->|UPDATE about_us| DB_ALL

    C_PROD & C_NEWS & C_VEN -->|On Delete with Image| FS_UNLINK
    FS_UNLINK -->|Remove Physical File| STOR

    DB_ALL -->|Return JSON Data/Status| UI
```

---

## 4. Matriks Pemetaan Rute & Arsitektur Layer

| Modul | Rute Frontend (Tampilan) | Middleware & Logic (Sistem) | Endpoint API & Handler (Backend) | Tabel Database / Storage |
|---|---|---|---|---|
| **Public Landing** | `/beranda` | `PublicService.getAbout()` | `GET /api/public/about` | `about_us` |
| **Public Katalog** | `/katalog-jasa` | `PublicService.getProducts()` | `GET /api/public/products` | `products`, `categories` |
| **Public Detail Jasa**| `/katalog-jasa/:slug` | `PublicService.getProductBySlug()` | `GET /api/public/products/:slug` | `products` |
| **Public Berita** | `/berita` | `PublicService.getNews()` | `GET /api/public/news` | `news`, `categories` |
| **Public Detail Berita**| `/berita/:slug` | `PublicService.getNewsBySlug()` | `GET /api/public/news/:slug` | `news` |
| **Admin Login** | `/login` | `AuthService.login()` | `POST /api/auth/login` | `users` (Bcrypt + JWT) |
| **Admin Dashboard** | `/admin/dashboard` | `AuthGuard` + `JwtInterceptor` | `GET /api/admin/dashboard/stats` | `news`, `products`, `categories`, `vendors` |
| **Admin Kategori** | `/admin/kategori-jasa` | `AuthGuard` + `authMiddleware` | `GET/POST/PUT/DELETE /api/admin/categories` | `categories` |
| **Admin Jasa/Produk**| `/admin/jasa` | `authMiddleware` + `Multer` | `GET/POST/PUT/DELETE /api/admin/products` | `products`, `/storage/uploads` |
| **Admin Berita** | `/admin/berita` | `authMiddleware` + `Multer` | `GET/POST/PUT/DELETE /api/admin/news` | `news`, `/storage/uploads` |
| **Admin Vendor** | `/admin/vendor` | `authMiddleware` + `Multer` | `GET/POST/PUT/DELETE /api/admin/vendors` | `vendors`, `/storage/uploads` |
| **Admin Profil** | `/admin/tentang-kami` | `authMiddleware` | `GET/PUT /api/admin/about` | `about_us` |
