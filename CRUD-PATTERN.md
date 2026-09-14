# 📘 CRUD-PATTERN.md — Referensi Standar Replikasi CRUD Modul Admin

Dokumen ini berisi standar arsitektur dan panduan replikasi untuk membuat fitur **CRUD (Create, Read, Update, Delete)** penuh pada modul Admin Ionic + Angular di project ini.

---

## 1. Daftar File yang Dibuat & Diubah

Berikut adalah struktur file dari implementasi referensi **Kategori Jasa** (`/admin/kategori-jasa`) & **Berita** (`/admin/berita`):

| File Path | Status | Deskripsi & Fungsi |
|---|---|---|
| `src/app/models/category.model.ts` | **[NEW]** | Interface TypeScript (`Category`, `CategoryType`, `CategoryResponse`, `CreateCategoryDto`, `UpdateCategoryDto`). |
| `src/app/models/news.model.ts` | **[NEW]** | Interface TypeScript (`News`, `CreateNewsDto`, `UpdateNewsDto`, `NewsResponse`, `UploadImageResponse`). |
| `src/app/services/category.service.ts` | **[NEW]** | Service RxJS untuk komunikasi API Backend, state management `BehaviorSubject`, dan persistence cache ke `localStorage`. |
| `src/app/services/news.service.ts` | **[NEW]** | Service RxJS Berita dengan `cms_berita_cache`, upload file helper, & status toggling. |
| `src/app/pages/admin/kategori-jasa/*` | **[MODIFY]** | Modul & Page CRUD Kategori Jasa. |
| `src/app/pages/admin/berita/*` | **[MODIFY]** | Modul & Page CRUD Berita (WYSIWYG Quill, custom upload, & preview modal). |

---

## 2. Konvensi Penamaan (Naming Conventions)

Setiap entitas baru **WAJIB** mematuhi standar penamaan berikut:

- **Nama Folder Modul**: `kebab-case` (contoh: `kategori-jasa`, `jasa`, `vendor`, `berita`)
- **Nama File**: `{entity-kebab-case}.{type}.ts` (contoh: `category.model.ts`, `news.service.ts`, `berita.page.ts`)
- **Nama Class Service**: `{EntityPascalCase}Service` (contoh: `CategoryService`, `NewsService`, `VendorService`)
- **Nama Class Component**: `{EntityPascalCase}Page` (contoh: `KategoriJasaPage`, `AdminBeritaPage`)
- **Nama Interface Model**: `{EntityPascalCase}` (contoh: `Category`, `News`, `Product`)
- **Storage Cache Key**: `cms_{entity_snake_case}_cache` (contoh: `cms_kategori_jasa_cache`, `cms_berita_cache`)

---

## 3. Checklist Replikasi CRUD Entitas Baru

Gunakan langkah-langkah berikut ketika membuat CRUD entitas baru (misalnya: `{Entity}` = `Vendor`, `Jasa`, `Produk`):

### Step 1: Cek Backend & API Contract (Gunakan `ENDPOINT_BACKEND.md` / `ai.md`)
> [!IMPORTANT]
> **JANGAN MENEBAK FIELD API.** Cek dokumen backend atau response API fisik untuk memastikan:
> - Field apa saja yang dikembalikan backend (`id`, `name`, `price`, `image`, `is_active`, dll).
> - Apakah entitas membutuhkan file upload / multipart form-data (`Multer`) (seperti gambar produk/logo vendor) atau sekadar JSON biasa.
> - Method & URL endpoint (contoh: `GET /api/admin/vendors`, `POST /api/admin/vendors`).

### Step 2: Buat File Model (`src/app/models/{entity}.model.ts`)
- Buat interface data utama, DTO Create/Update, dan interface `APIResponse`.

### Step 3: Buat File Service (`src/app/services/{entity}.service.ts`)
- Salin struktur `CategoryService` / `NewsService`.
- Sesuaikan `STORAGE_KEY` (misal: `cms_vendor_cache`).
- Ganti endpoint `apiUrl` sesuai backend route.
- Pastikan method `getCategories` / `getNews`, `create`, `update`, `delete` mengeksekusi `updateCache()` pada RxJS `tap()`.

### Step 4: Daftarkan `FormsModule` & `ReactiveFormsModule`
- Buka `src/app/pages/admin/{entity}/{entity}.module.ts`.
- Tambahkan `FormsModule` dan `ReactiveFormsModule` ke array `imports`.

### Step 5: Implementasikan Component Logic (`{entity}.page.ts`)
- Gunakan `inject(FormBuilder)`, `inject(AlertController)`, `inject(ToastController)`.
- Replikasi alur `ngOnInit()`:
  - Cek `hasCachedData` -> Tampilkan data cache + panggil `silentRefresh()`.
  - Jika belum ada -> Set `loading = true` + panggil `fetchData()`.
- Replikasi `loadData(event?)` dengan RxJS `finalize(() => event?.target?.complete())`.
- Gunakan `FormGroup` untuk Form Tambah/Edit.
- Replikasi dialog konfirmasi hapus menggunakan `alertCtrl.create({ header: 'Konfirmasi Hapus', ... })`.
- Replikasi pesan error 401: `"Sesi login sudah berakhir. Silakan login kembali."`.

### Step 6: Implementasikan Template UI (`{entity}.page.html`)
- Gunakan `<ion-refresher slot="fixed" (ionRefresh)="loadData($event)">`.
- Gunakan header `<section class="page-heading">` dengan tombol *Perbarui* (spin icon `fas fa-sync-alt`) dan tombol *+ Tambah*.
- Sertakan `<div *ngIf="errorMessage" class="error-banner">`.
- Gunakan `<ion-skeleton-text animated>` untuk state `*ngIf="loading"`.
- Gunakan `<div class="table-responsive">` untuk data table utama `*ngIf="!loading"`.
- Sertakan pagination footer dengan info data dan tombol Prev/Next.
- Buat `<ion-modal [isOpen]="isModalOpen" (didDismiss)="closeModal()">` berisi Form Tambah/Edit.

### Step 7: Verifikasi Build & Runtime
- Jalankan `npm run build` di folder `frontend/` untuk memastikan tidak ada error TypeScript atau budget SCSS.

---

## 4. Catatan Khusus Entitas Kategori Jasa (TIDAK Generik)

1. **Field `type` (`'PRODUCT' | 'NEWS'`)**:
   - Di Kategori Jasa, default `type` bernilai `'PRODUCT'`.
   - Entitas `Berita` memfilter kategori khusus dengan `type = 'NEWS'`.
2. **Auto Slug Generation**:
   - Backend & frontend men-generate slug otomatis dari `title`.
3. **Upload File / Multipart Form Data**:
   - Untuk entitas dengan gambar (seperti `Berita`), gunakan endpoint `POST /api/admin/upload` sebelum submit form JSON utama.

---

## 5. Pola untuk Entity dengan Rich Content & File Lifecycle Management (Berita / Long-Form)

> [!TIP]
> Gunakan pola ini untuk entitas lain yang memiliki **konten rich text** (HTML bebas) dan **siklus hidup file gambar terintegrasi** (seperti Deskripsi Jasa Panjang, Artikel Blog, atau Halaman Tentang Kami).

### 1. Integrasi Editor WYSIWYG (`ngx-quill`)
- Install `ngx-quill` dan `quill` pada `package.json`.
- Import `QuillModule.forRoot()` pada `{entity}.module.ts`.
- Import CSS Quill pada `src/global.scss`:
  ```scss
  @import "quill/dist/quill.core.css";
  @import "quill/dist/quill.snow.css";
  ```
- Konfigurasi custom image handler di controller component agar pengunggahan gambar dari toolbar Quill tidak meng-embed base64, melainkan mengunggah ke backend upload API dan menyisipkan URL `/uploads/filename.jpg`.

### 2. Aturan Format Penamaan File Gambar Fisik
- Semua file foto yang diunggah (baik Featured Cover Image maupun Gambar Inline Editor) disimpan di direktori `backend/uploads/` dan disajikan statis via `app.use('/uploads', express.static(...))`.
- Backend men-rename nama file secara otomatis dengan pola:
  `{slugberita}#{foto_keberapa}.{ext}`
  *(Contoh: `peresmian-proyek-baru#1.jpg`, `peresmian-proyek-baru#2.png`)*.

### 3. Pembersihan File Storage Saat Data Dihapus (Deletion Cleanup)
- Ketika entitas dihapus (`DELETE /api/admin/news/:id`), controller backend `newsController.js` wajib melakukan langkah pembersihan:
  1. Menghapus file gambar sampul utama (`newsItem.image`).
  2. Memindai semua tag `<img src="/uploads/...">` di dalam string HTML `content` dan menghapus seluruh file fisik terkait dari disk storage (`fs.unlinkSync`).
  3. Menghapus record database.

### 4. Sanitasi HTML Dua Lapis (Dual-Layer Sanitization)
- **Backend**: Sanitasi string `content` sebelum disimpan ke database (menghapus `<script>`, event handler `onclick`, `javascript:` protocol).
- **Frontend**: Gunakan Angular `DomSanitizer` (`bypassSecurityTrustHtml`) saat merender `[innerHTML]` pada preview modal atau halaman detail publik.

### 5. Excerpt & Preview Modal
- Auto-generate plain text excerpt dengan menghapus tag HTML regex `/<[^>]*>/g` dan memotong teks (misal 130 karakter).
- Sediakan modal **Preview Tampilan** pada form create/edit agar admin dapat meninjau tata letak artikel sebelum dipublikasikan.
