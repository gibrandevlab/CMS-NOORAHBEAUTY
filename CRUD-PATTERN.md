# 📘 CRUD-PATTERN.md — Referensi Standar Replikasi CRUD Modul Admin

Dokumen ini berisi standar arsitektur dan panduan replikasi untuk membuat fitur **CRUD (Create, Read, Update, Delete)** penuh pada modul Admin Ionic + Angular di project ini.

---

## 1. Daftar File yang Dibuat & Diubah

Berikut adalah struktur file dari implementasi referensi **Kategori Jasa** (`/admin/kategori-jasa`):

| File Path | Status | Deskripsi & Fungsi |
|---|---|---|
| `src/app/models/category.model.ts` | **[NEW]** | Interface TypeScript (`Category`, `CategoryType`, `CategoryResponse`, `CreateCategoryDto`, `UpdateCategoryDto`). |
| `src/app/services/category.service.ts` | **[NEW]** | Service RxJS untuk komunikasi API Backend, state management `BehaviorSubject`, dan persistence cache ke `localStorage`. |
| `src/app/pages/admin/kategori-jasa/kategori-jasa.module.ts` | **[MODIFY]** | Angular Module yang meng-import `IonicModule`, `FormsModule`, `ReactiveFormsModule`, serta routing module. |
| `src/app/pages/admin/kategori-jasa/kategori-jasa.page.ts` | **[MODIFY]** | Controller logika halaman: initial skeleton loading, silent refresh, search, pagination, reactive form, `ion-alert` delete confirm, `ion-toast`, & `finalize()` handler. |
| `src/app/pages/admin/kategori-jasa/kategori-jasa.page.html` | **[MODIFY]** | Template UI: `ion-refresher`, searchbar, controls per-halaman, skeleton loader, data table, pagination controls, & `ion-modal` reactive form. |
| `src/app/pages/admin/kategori-jasa/kategori-jasa.page.scss` | **[MODIFY]** | Stylesheet komponen dengan penataan tabel responsif, badge tipe, status buttons, & styling modal. |



---

## 2. Konvensi Penamaan (Naming Conventions)

Setiap entitas baru **WAJIB** mematuhi standar penamaan berikut:

- **Nama Folder Modul**: `kebab-case` (contoh: `kategori-jasa`, `jasa`, `vendor`)
- **Nama File**: `{entity-kebab-case}.{type}.ts` (contoh: `category.model.ts`, `vendor.service.ts`, `vendor.page.ts`)
- **Nama Class Service**: `{EntityPascalCase}Service` (contoh: `CategoryService`, `VendorService`)
- **Nama Class Component**: `{EntityPascalCase}Page` (contoh: `KategoriJasaPage`, `VendorPage`)
- **Nama Interface Model**: `{EntityPascalCase}` (contoh: `Category`, `Vendor`, `Product`)
- **Storage Cache Key**: `cms_{entity_snake_case}_cache` (contoh: `cms_kategori_jasa_cache`, `cms_vendor_cache`)

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
- Salin struktur `CategoryService`.
- Sesuaikan `STORAGE_KEY` (misal: `cms_vendor_cache`).
- Ganti endpoint `apiUrl` sesuai backend route.
- Pastikan method `getCategories` / `getVendors`, `create`, `update`, `delete` mengeksekusi `updateCache()` pada RxJS `tap()`.

### Step 4: Daftarkan `FormsModule` & `ReactiveFormsModule`
- Buka `src/app/pages/admin/{entity}/{entity}.module.ts`.
- Tambahkan `FormsModule` dan `ReactiveFormsModule` ke array `imports`.

### Step 5: Implementasikan Component Logic (`{entity}.page.ts`)
- Gunakan `inject(FormBuilder)`, `inject(AlertController)`, `inject(ToastController)`.
- Replikasi alur `ngOnInit()`:
  - Cek `hasCachedData` -> Tampilkan data cache + panggil `silentRefresh()`.
  - Jika belum ada -> Set `loading = true` + panggil `fetchData()`.
- Replikasi `loadCategories(event?)` dengan RxJS `finalize(() => event?.target?.complete())`.
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

Beberapa logika berikut spesifik untuk **Kategori Jasa** dan **JANGAN** langsung disalin mentah-mentah ke entitas lain:

1. **Field `type` (`'PRODUCT' | 'NEWS'`)**:
   - Di Kategori Jasa, default `type` bernilai `'PRODUCT'`.
   - Entitas lain seperti `Vendor` atau `Berita` tidak memiliki field enum `type` ini, melainkan memiliki field khusus seperti `contact`, `image`, `price`, atau `category_id`.
2. **Auto Slug Generation**:
   - Backend Kategori akan otomatis men-generate slug jika `slug` kosong.
   - Pada entitas lain seperti `Vendor`, backend tidak menggunakan slug (hanya ID).
3. **Upload File / Multipart Form Data**:
   - Kategori Jasa hanya berupa form teks biasa (tanpa upload gambar).
   - Untuk entitas `Produk`, `Berita`, atau `Vendor`, form menggunakan file upload (`<input type="file">` / `FormData`), sehingga penanganan form submission wajib disesuaikan menjadi `FormData`.
