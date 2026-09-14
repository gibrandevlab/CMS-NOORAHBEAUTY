import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-jasa',
  templateUrl: './jasa.page.html',
  styleUrls: ['./jasa.page.scss'],
  standalone: false,
})
export class JasaPage implements OnInit {
  protected readonly Math = Math;
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  private readonly fb = inject(FormBuilder);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  refreshing = false;
  errorMessage = '';

  // Filter Search & Pagination
  searchQuery = '';
  selectedCategoryId: number | 'ALL' = 'ALL';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Modal State & Form
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  submitting = false;
  productForm!: FormGroup;

  // File Upload State
  uploadingImage = false;
  imagePreviewUrl: string | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.loadCategoriesDropdown();

    if (this.productService.hasCachedData) {
      this.products = [...this.productService.cachedProducts];
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchProducts();
    }
  }

  private initForm() {
    this.productForm = this.fb.group({
      category_id: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      slug: ['', [Validators.maxLength(255)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      image: [''],
      is_active: [true],
    });
  }

  private loadCategoriesDropdown() {
    this.categoryService.getCategories('PRODUCT').subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.categories = res.data;
        }
      },
    });
  }

  /** Fetch awal saat tidak ada cache */
  private fetchProducts() {
    this.errorMessage = '';
    this.productService.getProducts().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.products = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat daftar jasa / produk.');
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.productService.getProducts().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.products = res.data;
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Dipanggil oleh ion-refresher atau tombol "Perbarui" */
  loadProducts(event?: any) {
    this.loadCategoriesDropdown();

    if (event) {
      this.productService
        .getProducts()
        .pipe(
          finalize(() => {
            event.target.complete();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              this.products = res.data;
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data jasa.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  /** Formatter URL Gambar */
  getImageUrl(imagePath: string | null): string {
    if (!imagePath) return 'assets/shapes.svg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${environment.apiUrl.replace('/api', '')}${cleanPath}`;
  }

  /** Format Rupiah */
  formatRupiah(amount: number | string): string {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  }

  /** Getters untuk Search & Pagination */
  get filteredProducts(): Product[] {
    let result = this.products;

    if (this.selectedCategoryId !== 'ALL') {
      result = result.filter((p) => p.category_id === Number(this.selectedCategoryId));
    }

    if (!this.searchQuery.trim()) {
      return result;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(query))
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize) || 1;
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /** Upload Handler */
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Ukuran file maksimal 5MB.', 'warning');
      return;
    }

    this.uploadingImage = true;
    this.productService
      .uploadImage(file)
      .pipe(finalize(() => (this.uploadingImage = false)))
      .subscribe({
        next: (res) => {
          if (res?.success && res.url) {
            this.productForm.patchValue({ image: res.url });
            this.imagePreviewUrl = this.getImageUrl(res.url);
            this.showToast('Gambar berhasil diunggah.', 'success');
          }
        },
        error: (err) => {
          this.handleError(err, 'Gagal mengunggah gambar.');
        },
      });
  }

  removeImage() {
    this.productForm.patchValue({ image: '' });
    this.imagePreviewUrl = null;
  }

  /** Modal Handling */
  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.imagePreviewUrl = null;
    this.productForm.reset({
      category_id: this.categories.length > 0 ? this.categories[0].id : '',
      name: '',
      slug: '',
      description: '',
      price: 0,
      image: '',
      is_active: true,
    });
    this.isModalOpen = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.editingId = product.id;
    this.imagePreviewUrl = product.image ? this.getImageUrl(product.image) : null;
    this.productForm.patchValue({
      category_id: product.category_id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      image: product.image || '',
      is_active: product.is_active,
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitting = false;
    this.uploadingImage = false;
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = {
      ...this.productForm.value,
      category_id: Number(this.productForm.value.category_id),
      price: Number(this.productForm.value.price) || 0,
    };

    if (this.isEditing && this.editingId) {
      this.productService
        .updateProduct(this.editingId, formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Data jasa berhasil diperbarui.', 'success');
              this.closeModal();
              this.syncLocalListAfterUpdate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data jasa.');
          },
        });
    } else {
      this.productService
        .createProduct(formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Data jasa berhasil ditambahkan.', 'success');
              this.closeModal();
              this.syncLocalListAfterCreate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal menambahkan data jasa.');
          },
        });
    }
  }

  toggleActive(product: Product, event: any) {
    event.stopPropagation();
    this.productService.toggleActiveStatus(product.id, product.is_active).subscribe({
      next: (res) => {
        if (res.success) {
          const statusText = res.data.is_active ? 'diaktifkan' : 'dinonaktifkan';
          this.showToast(`Status jasa "${product.name}" berhasil ${statusText}.`, 'success');
          this.syncLocalListAfterUpdate(res.data);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal merubah status jasa.');
      },
    });
  }

  /** Confirm Delete Alert */
  async confirmDelete(product: Product) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus jasa <strong>"${product.name}"</strong>?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.deleteProduct(product.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Data jasa berhasil dihapus.', 'success');
          this.products = this.products.filter((p) => p.id !== id);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal menghapus data jasa.');
      },
    });
  }

  private syncLocalListAfterCreate(newProduct: Product) {
    // Lookup category object for local list
    const cat = this.categories.find((c) => c.id === newProduct.category_id);
    const enriched = { ...newProduct, category: cat };
    this.products = [enriched, ...this.products];
  }

  private syncLocalListAfterUpdate(updatedProduct: Product) {
    const cat = this.categories.find((c) => c.id === updatedProduct.category_id);
    const enriched = { ...updatedProduct, category: cat || updatedProduct.category };
    this.products = this.products.map((p) => (p.id === updatedProduct.id ? enriched : p));
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }

  private handleError(err: any, defaultMsg: string) {
    let msg = defaultMsg;
    if (err?.status === 401) {
      msg = 'Sesi login sudah berakhir. Silakan login kembali.';
    } else if (err?.error?.message) {
      msg = err.error.message;
    }
    this.errorMessage = msg;
    this.showToast(msg, 'danger');
  }
}
