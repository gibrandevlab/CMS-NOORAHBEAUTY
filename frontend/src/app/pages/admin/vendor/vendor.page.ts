import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { Vendor } from '../../../models/vendor.model';
import { VendorService } from '../../../services/vendor.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.page.html',
  styleUrls: ['./vendor.page.scss'],
  standalone: false,
})
export class VendorPage implements OnInit {
  protected readonly Math = Math;
  private readonly vendorService = inject(VendorService);

  private readonly fb = inject(FormBuilder);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  vendors: Vendor[] = [];
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
  vendorForm!: FormGroup;

  // File Upload State
  uploadingLogo = false;
  logoPreviewUrl: string | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    if (this.vendorService.hasCachedData) {
      this.vendors = [...this.vendorService.cachedVendors];
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchVendors();
    }
  }

  private initForm() {
    this.vendorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      logo: [''],
      address: [''],
      contact: [''],
    });
  }

  /** Fetch awal saat tidak ada cache */
  private fetchVendors() {
    this.errorMessage = '';
    this.vendorService.getVendors().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.vendors = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat daftar vendor.');
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.vendorService.getVendors().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.vendors = res.data;
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Dipanggil oleh ion-refresher atau tombol "Perbarui" */
  loadVendors(event?: any) {
    if (event) {
      this.vendorService
        .getVendors()
        .pipe(
          finalize(() => {
            event.target.complete();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              this.vendors = res.data;
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data vendor.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  /** Formatter URL Logo */
  getLogoUrl(logoPath: string | null): string {
    if (!logoPath) return 'assets/shapes.svg';
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
      return logoPath;
    }
    const cleanPath = logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
    return `${environment.apiUrl.replace('/api', '')}${cleanPath}`;
  }

  /** Getters untuk Search & Pagination */
  get filteredVendors(): Vendor[] {
    if (!this.searchQuery.trim()) {
      return this.vendors;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        (v.address && v.address.toLowerCase().includes(query)) ||
        (v.contact && v.contact.toLowerCase().includes(query))
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVendors.length / this.pageSize) || 1;
  }

  get paginatedVendors(): Vendor[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredVendors.slice(startIndex, startIndex + this.pageSize);
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

  /** Upload Logo Handler */
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Ukuran file maksimal 5MB.', 'warning');
      return;
    }

    this.uploadingLogo = true;
    this.vendorService
      .uploadLogo(file)
      .pipe(finalize(() => (this.uploadingLogo = false)))
      .subscribe({
        next: (res) => {
          if (res?.success && res.url) {
            this.vendorForm.patchValue({ logo: res.url });
            this.logoPreviewUrl = this.getLogoUrl(res.url);
            this.showToast('Logo vendor berhasil diunggah.', 'success');
          }
        },
        error: (err) => {
          this.handleError(err, 'Gagal mengunggah logo vendor.');
        },
      });
  }

  removeLogo() {
    this.vendorForm.patchValue({ logo: '' });
    this.logoPreviewUrl = null;
  }

  /** Modal Handling */
  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.logoPreviewUrl = null;
    this.vendorForm.reset({
      name: '',
      logo: '',
      address: '',
      contact: '',
    });
    this.isModalOpen = true;
  }

  openEditModal(vendor: Vendor) {
    this.isEditing = true;
    this.editingId = vendor.id;
    this.logoPreviewUrl = vendor.logo ? this.getLogoUrl(vendor.logo) : null;
    this.vendorForm.patchValue({
      name: vendor.name,
      logo: vendor.logo || '',
      address: vendor.address || '',
      contact: vendor.contact || '',
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitting = false;
    this.uploadingLogo = false;
  }

  saveVendor() {
    if (this.vendorForm.invalid) {
      this.vendorForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.vendorForm.value;

    if (this.isEditing && this.editingId) {
      this.vendorService
        .updateVendor(this.editingId, formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Data vendor berhasil diperbarui.', 'success');
              this.closeModal();
              this.syncLocalListAfterUpdate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data vendor.');
          },
        });
    } else {
      this.vendorService
        .createVendor(formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Data vendor berhasil ditambahkan.', 'success');
              this.closeModal();
              this.syncLocalListAfterCreate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal menambahkan data vendor.');
          },
        });
    }
  }

  /** Confirm Delete Alert */
  async confirmDelete(vendor: Vendor) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus vendor <strong>"${vendor.name}"</strong>?`,
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
            this.deleteVendor(vendor.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteVendor(id: number) {
    this.vendorService.deleteVendor(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Data vendor berhasil dihapus.', 'success');
          this.vendors = this.vendors.filter((v) => v.id !== id);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal menghapus data vendor.');
      },
    });
  }

  private syncLocalListAfterCreate(newVendor: Vendor) {
    this.vendors = [newVendor, ...this.vendors];
  }

  private syncLocalListAfterUpdate(updatedVendor: Vendor) {
    this.vendors = this.vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v));
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
