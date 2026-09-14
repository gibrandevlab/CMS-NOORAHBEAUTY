import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Category, CategoryType } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-kategori-jasa',
  templateUrl: './kategori-jasa.page.html',
  styleUrls: ['./kategori-jasa.page.scss'],
  standalone: false,
})
export class KategoriJasaPage implements OnInit {
  protected readonly Math = Math;
  private readonly categoryService = inject(CategoryService);

  private readonly fb = inject(FormBuilder);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  categories: Category[] = [];
  loading = false;
  refreshing = false;
  errorMessage = '';

  // Filter Search & Pagination
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Modal State & Form
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  submitting = false;
  categoryForm!: FormGroup;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    if (this.categoryService.hasCachedData) {
      this.categories = [...this.categoryService.cachedCategories];
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchCategories();
    }
  }

  private initForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      slug: ['', [Validators.maxLength(255)]],
      type: ['PRODUCT' as CategoryType, [Validators.required]],
    });
  }

  /** Fetch awal saat tidak ada cache */
  private fetchCategories() {
    this.errorMessage = '';
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.categories = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat daftar kategori jasa.');
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam: data lama tetap tampil, hanya indikator berputar */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.categories = res.data;
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Dipanggil oleh ion-refresher atau tombol "Perbarui" */
  loadCategories(event?: any) {
    if (event) {
      this.categoryService
        .getCategories()
        .pipe(
          finalize(() => {
            event.target.complete();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              this.categories = res.data;
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data kategori jasa.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  /** Getters untuk Search & Pagination */
  get filteredCategories(): Category[] {
    if (!this.searchQuery.trim()) {
      return this.categories;
    }
    const query = this.searchQuery.toLowerCase().trim();
    return this.categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        cat.type.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCategories.length / this.pageSize) || 1;
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategories.slice(startIndex, startIndex + this.pageSize);
  }

  onSearchChange() {
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

  /** Modal Handling */
  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.categoryForm.reset({
      name: '',
      slug: '',
      type: 'PRODUCT',
    });
    this.isModalOpen = true;
  }

  openEditModal(category: Category) {
    this.isEditing = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      type: category.type,
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitting = false;
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.categoryForm.value;

    if (this.isEditing && this.editingId) {
      this.categoryService
        .updateCategory(this.editingId, formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Kategori jasa berhasil diperbarui.', 'success');
              this.closeModal();
              this.syncLocalListAfterUpdate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui kategori jasa.');
          },
        });
    } else {
      this.categoryService
        .createCategory(formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Kategori jasa berhasil ditambahkan.', 'success');
              this.closeModal();
              this.syncLocalListAfterCreate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal menambahkan kategori jasa.');
          },
        });
    }
  }

  /** Confirm Delete Alert */
  async confirmDelete(category: Category) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus kategori <strong>"${category.name}"</strong>?`,
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
            this.deleteCategory(category.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteCategory(id: number) {
    this.categoryService.deleteCategory(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Kategori jasa berhasil dihapus.', 'success');
          this.categories = this.categories.filter((cat) => cat.id !== id);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal menghapus kategori jasa.');
      },
    });
  }

  private syncLocalListAfterCreate(newCat: Category) {
    this.categories = [newCat, ...this.categories];
  }

  private syncLocalListAfterUpdate(updatedCat: Category) {
    this.categories = this.categories.map((c) => (c.id === updatedCat.id ? updatedCat : c));
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
