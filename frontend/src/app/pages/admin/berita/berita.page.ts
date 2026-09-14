import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AlertController, ToastController } from '@ionic/angular';
import { QuillEditorComponent } from 'ngx-quill';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/category.model';
import { News } from '../../../models/news.model';
import { CategoryService } from '../../../services/category.service';
import { NewsService } from '../../../services/news.service';

@Component({
  selector: 'app-admin-berita',
  templateUrl: './berita.page.html',
  styleUrls: ['./berita.page.scss'],
  standalone: false,
})
export class AdminBeritaPage implements OnInit {
  protected readonly Math = Math;
  readonly imagePlaceholderUrl = 'https://placehold.net/400x400.png';

  private readonly newsService = inject(NewsService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('quillEditor') quillEditor?: QuillEditorComponent;

  newsList: News[] = [];
  newsCategories: Category[] = [];

  loading = false;
  refreshing = false;
  errorMessage = '';

  // Filter Search, Category & Pagination
  searchQuery = '';
  selectedCategoryFilter: number | 'ALL' = 'ALL';
  selectedStatusFilter: 'ALL' | 'PUBLISHED' | 'DRAFT' = 'ALL';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Modal State & Form
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  submitting = false;
  uploadingImage = false;
  newsForm!: FormGroup;

  // Preview Modal State
  isPreviewOpen = false;
  previewNewsItem: News | null = null;

  // Configuration Toolbar Quill
  quillModules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, 4, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: () => this.handleQuillImageUpload(),
      },
    },
  };

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    this.loadNewsCategories();

    if (this.newsService.hasCachedData) {
      this.newsList = [...this.newsService.cachedNews];
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchNews();
    }
  }

  private initForm() {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.maxLength(255)]],
      category_id: [null, [Validators.required]],
      content: ['', [Validators.required]],
      image: [''],
      is_published: [true],
    });
  }

  /** Mengambil daftar kategori bertipe 'NEWS' */
  private loadNewsCategories() {
    this.categoryService.getCategories('NEWS').subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.newsCategories = res.data;
        }
      },
    });
  }

  /** Fetch data berita awal */
  private fetchNews() {
    this.errorMessage = '';
    this.newsService.getNews().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat daftar berita.');
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.newsService.getNews().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Pull-to-refresh / manual refresh */
  loadNews(event?: any) {
    if (event) {
      this.newsService
        .getNews()
        .pipe(finalize(() => event.target.complete()))
        .subscribe({
          next: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              this.newsList = res.data;
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui daftar berita.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  /** Auto-generate slug dari title jika belum diubah manual */
  onTitleInput() {
    if (this.isEditing) return; // Jangan timpa slug saat edit berita lama
    const titleVal = this.newsForm.get('title')?.value || '';
    const slugVal = this.slugify(titleVal);
    this.newsForm.patchValue({ slug: slugVal }, { emitEvent: false });
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  /** Helper URL Gambar Lengkap untuk rendering <img> */
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return this.imagePlaceholderUrl;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const backendBase = environment.apiUrl.replace(/\/api$/, '');
    return `${backendBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src !== this.imagePlaceholderUrl) {
      image.src = this.imagePlaceholderUrl;
    }
  }

  /** Auto-generate Plain Text Excerpt untuk preview list */
  getExcerpt(htmlContent: string | null | undefined, maxLength = 130): string {
    if (!htmlContent) return '-';
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  /** Sanitasi HTML untuk rendered Angular content */
  getSanitizedHtml(htmlContent: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent || '');
  }

  /** Filter & Pagination Getters */
  get filteredNews(): News[] {
    let result = this.newsList;

    if (this.selectedCategoryFilter !== 'ALL') {
      const catId = Number(this.selectedCategoryFilter);
      result = result.filter((item) => item.category_id === catId);
    }

    if (this.selectedStatusFilter === 'PUBLISHED') {
      result = result.filter((item) => item.is_published === true);
    } else if (this.selectedStatusFilter === 'DRAFT') {
      result = result.filter((item) => item.is_published === false);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          (item.category?.name && item.category.name.toLowerCase().includes(query))
      );
    }

    return result;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredNews.length / this.pageSize) || 1;
  }

  get paginatedNews(): News[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredNews.slice(startIndex, startIndex + this.pageSize);
  }

  onFilterChange() {
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
    this.newsForm.reset({
      title: '',
      slug: '',
      category_id: this.newsCategories.length > 0 ? this.newsCategories[0].id : null,
      content: '',
      image: '',
      is_published: true,
    });
    this.isModalOpen = true;
  }

  openEditModal(item: News) {
    this.isEditing = true;
    this.editingId = item.id;
    this.newsForm.patchValue({
      title: item.title,
      slug: item.slug,
      category_id: item.category_id,
      content: item.content,
      image: item.image || '',
      is_published: item.is_published,
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitting = false;
    this.uploadingImage = false;
  }

  /** Featured Cover Image Upload Handler */
  onFeaturedFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const currentSlug = this.newsForm.get('slug')?.value || this.slugify(this.newsForm.get('title')?.value || 'berita');

    this.uploadingImage = true;
    this.newsService
      .uploadImage(file, currentSlug)
      .pipe(finalize(() => (this.uploadingImage = false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.url) {
            this.newsForm.patchValue({ image: res.url });
            this.showToast(`Gambar sampul berhasil diunggah: ${res.filename}`, 'success');
          }
        },
        error: (err) => {
          this.handleError(err, 'Gagal mengunggah gambar sampul.');
        },
      });
  }

  /** Custom Quill Inline Image Upload Handler */
  private handleQuillImageUpload() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      const currentSlug = this.newsForm.get('slug')?.value || this.slugify(this.newsForm.get('title')?.value || 'berita');

      this.showToast('Mengunggah gambar ke dalam editor...', 'warning');

      this.newsService.uploadImage(file, currentSlug).subscribe({
        next: (res) => {
          if (res.success && res.url) {
            const fullUrl = this.getImageUrl(res.url);
            const quill = this.quillEditor?.quillEditor;
            if (quill) {
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, 'image', fullUrl);
              quill.setSelection(range.index + 1);
            }
            this.showToast('Gambar berhasil disisipkan ke isi berita.', 'success');
          }
        },
        error: (err) => {
          this.handleError(err, 'Gagal mengunggah gambar inline berita.');
        },
      });
    };
  }

  /** Save Berita */
  saveNews() {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      this.showToast('Mohon lengkapi semua field wajib.', 'warning');
      return;
    }

    this.submitting = true;
    const formValue = this.newsForm.value;

    if (this.isEditing && this.editingId) {
      this.newsService
        .updateNews(this.editingId, formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Berita berhasil diperbarui.', 'success');
              this.closeModal();
              this.syncLocalListAfterUpdate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui berita.');
          },
        });
    } else {
      this.newsService
        .createNews(formValue)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.showToast('Berita berhasil dibuat.', 'success');
              this.closeModal();
              this.syncLocalListAfterCreate(res.data);
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal membuat berita.');
          },
        });
    }
  }

  /** Toggle Status Published / Draft */
  toggleStatus(item: News, event: Event) {
    event.stopPropagation();
    this.newsService.togglePublishStatus(item.id, item.is_published).subscribe({
      next: (res) => {
        if (res.success) {
          const statusLabel = res.data.is_published ? 'Diterbitkan' : 'Draft';
          this.showToast(`Status berita diubah menjadi: ${statusLabel}`, 'success');
          this.syncLocalListAfterUpdate(res.data);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal mengubah status berita.');
      },
    });
  }

  /** Preview Modal Handling */
  openPreviewModal(item: News) {
    this.previewNewsItem = item;
    this.isPreviewOpen = true;
  }

  openFormPreview() {
    const categoryObj = this.newsCategories.find(
      (c) => c.id === Number(this.newsForm.get('category_id')?.value)
    );
    this.previewNewsItem = {
      id: 0,
      title: this.newsForm.get('title')?.value || 'Judul Berita',
      slug: this.newsForm.get('slug')?.value || 'slug-berita',
      category_id: Number(this.newsForm.get('category_id')?.value),
      content: this.newsForm.get('content')?.value || '<p>Belum ada isi konten...</p>',
      image: this.newsForm.get('image')?.value || null,
      is_published: Boolean(this.newsForm.get('is_published')?.value),
      category: categoryObj,
      createdAt: new Date().toISOString(),
    };
    this.isPreviewOpen = true;
  }

  closePreviewModal() {
    this.isPreviewOpen = false;
    this.previewNewsItem = null;
  }

  /** Confirm Delete Alert */
  async confirmDelete(item: News) {
    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus Berita',
      message: `Apakah Anda yakin ingin menghapus berita <strong>"${item.title}"</strong>?<br/><br/><small class="text-danger">*Foto sampul dan foto-foto di dalam isi berita akan dihapus secara permanen dari server storage.</small>`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Hapus Berita & Foto',
          role: 'destructive',
          handler: () => {
            this.deleteNews(item.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteNews(id: number) {
    this.newsService.deleteNews(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showToast('Berita dan semua foto terkait berhasil dihapus.', 'success');
          this.newsList = this.newsList.filter((item) => item.id !== id);
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal menghapus berita.');
      },
    });
  }

  private syncLocalListAfterCreate(newItem: News) {
    // Attach category object jika ada
    if (!newItem.category && newItem.category_id) {
      newItem.category = this.newsCategories.find((c) => c.id === newItem.category_id);
    }
    this.newsList = [newItem, ...this.newsList];
  }

  private syncLocalListAfterUpdate(updatedItem: News) {
    if (!updatedItem.category && updatedItem.category_id) {
      updatedItem.category = this.newsCategories.find((c) => c.id === updatedItem.category_id);
    }
    this.newsList = this.newsList.map((item) => (item.id === updatedItem.id ? updatedItem : item));
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
