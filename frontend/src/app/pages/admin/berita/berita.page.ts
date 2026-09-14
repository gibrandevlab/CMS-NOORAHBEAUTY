import { ChangeDetectorRef, Component, ElementRef, inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly zone = inject(NgZone);

  @ViewChild('quillEditor') quillEditor?: QuillEditorComponent;
  @ViewChild('cropCanvas') cropCanvas?: ElementRef<HTMLCanvasElement>;

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
  isImagePreviewOpen = false;
  imagePreviewUrl = '';
  imagePreviewAlt = '';
  isCreatePage = false;

  isCropperOpen = false;
  cropSourceUrl = '';
  cropSourceFile: File | null = null;
  cropUploadKind: 'cover' | 'inline' = 'cover';
  cropRatio = '16:9';
  cropZoom = 1;
  cropPositionX = 50;
  cropPositionY = 50;
  cropRatioOptions = [
    { value: 'original', label: 'Asli' },
    { value: '1:1', label: '1 : 1' },
    { value: '4:3', label: '4 : 3' },
    { value: '16:9', label: '16 : 9' },
    { value: '3:4', label: '3 : 4' },
  ];
  private cropImage = new Image();

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
    this.isCreatePage = Boolean(this.route.snapshot.data['createPage']);
    this.loadNewsCategories();

    if (this.isCreatePage) {
      this.prepareCreateForm();
      return;
    }

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
          if (this.isCreatePage && !this.newsForm.get('category_id')?.value && this.newsCategories.length > 0) {
            this.newsForm.patchValue({ category_id: this.newsCategories[0].id });
          }
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
      if (imagePath.includes('#') && imagePath.includes('/uploads/')) {
        return imagePath.replace(/#/g, '%23');
      }
      return imagePath;
    }
    const backendBase = environment.assetUrl || environment.apiUrl.replace(/\/api$/, '');
    const encodedPath = imagePath
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return `${backendBase}${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src !== this.imagePlaceholderUrl) {
      image.src = this.imagePlaceholderUrl;
    }
  }

  /** Normalisasi URL gambar inline <img src="..."> di dalam HTML content */
  processContentImageUrls(htmlContent: string | null | undefined): string {
    if (!htmlContent) return '';
    const backendBase = environment.assetUrl || environment.apiUrl.replace(/\/api$/, '');

    return htmlContent.replace(/<img([^>]+)src=["']([^"']+)["']/gi, (match, p1, src) => {
      let finalSrc = src;
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        if (src.includes('/uploads/')) {
          const pathIndex = src.indexOf('/uploads/');
          const pathPart = src.substring(pathIndex);
          const encodedPath = pathPart
            .split('/')
            .map((seg: string) => encodeURIComponent(decodeURIComponent(seg)))
            .join('/');
          finalSrc = `${backendBase}${encodedPath}`;
        }
      } else {
        const cleanPath = src.startsWith('/') ? src : '/' + src;
        const encodedPath = cleanPath
          .split('/')
          .map((seg: string) => encodeURIComponent(decodeURIComponent(seg)))
          .join('/');
        finalSrc = `${backendBase}${encodedPath}`;
      }
      return `<img${p1}src="${finalSrc}"`;
    });
  }

  /** Auto-generate Plain Text Excerpt untuk preview list */
  getExcerpt(htmlContent: string | null | undefined, maxLength = 130): string {
    if (!htmlContent) return '-';
    const textContent = new DOMParser().parseFromString(htmlContent, 'text/html').body.textContent || '';
    const plainText = textContent.replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  /** Sanitasi & Normalisasi HTML untuk rendered Angular content */
  getSanitizedHtml(htmlContent: string | null | undefined): SafeHtml {
    const processedHtml = this.processContentImageUrls(htmlContent);
    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
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
    this.router.navigate(['/admin/berita/tambah']);
  }

  private prepareCreateForm() {
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
    this.isModalOpen = false;
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

  openImagePreview(item: News) {
    this.imagePreviewUrl = this.getImageUrl(item.image);
    this.imagePreviewAlt = item.title;
    this.isImagePreviewOpen = true;
  }

  closeImagePreview() {
    this.isImagePreviewOpen = false;
    this.imagePreviewUrl = '';
    this.imagePreviewAlt = '';
  }

  /** Featured Cover Image Upload Handler */
  onFeaturedFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.openCropper(file, 'cover');
    input.value = '';
  }

  openCropper(file: File, kind: 'cover' | 'inline') {
    this.cropSourceFile = file;
    this.cropUploadKind = kind;
    this.cropRatio = kind === 'cover' ? '16:9' : 'original';
    this.cropZoom = 1;
    this.cropPositionX = 50;
    this.cropPositionY = 50;
    this.cropSourceUrl = URL.createObjectURL(file);
    this.cropImage = new Image();
    this.cropImage.onload = () => {
      this.zone.run(() => {
        this.isCropperOpen = true;
        this.changeDetector.detectChanges();
        requestAnimationFrame(() => this.drawCropPreview());
        setTimeout(() => this.drawCropPreview(), 100);
        setTimeout(() => this.drawCropPreview(), 300);
      });
    };
    this.cropImage.onerror = () => {
      this.zone.run(() => this.handleError(null, 'File gambar tidak dapat dibaca.'));
    };
    this.cropImage.src = this.cropSourceUrl;
  }

  closeCropper() {
    this.isCropperOpen = false;
    if (this.cropSourceUrl) URL.revokeObjectURL(this.cropSourceUrl);
    this.cropSourceUrl = '';
    this.cropSourceFile = null;
  }

  onCropSettingsChange() {
    this.drawCropPreview();
  }

  private getCropAspectRatio(): number {
    if (this.cropRatio === 'original') {
      return this.cropImage.width / this.cropImage.height || 1;
    }
    const [width, height] = this.cropRatio.split(':').map(Number);
    return width / height;
  }

  private getCropBounds() {
    const imageWidth = this.cropImage.width;
    const imageHeight = this.cropImage.height;
    const aspectRatio = this.getCropAspectRatio();
    let cropWidth = imageWidth / this.cropZoom;
    let cropHeight = cropWidth / aspectRatio;

    if (cropHeight > imageHeight / this.cropZoom) {
      cropHeight = imageHeight / this.cropZoom;
      cropWidth = cropHeight * aspectRatio;
    }

    const maxX = imageWidth - cropWidth;
    const maxY = imageHeight - cropHeight;
    return {
      x: (maxX * this.cropPositionX) / 100,
      y: (maxY * this.cropPositionY) / 100,
      width: cropWidth,
      height: cropHeight,
    };
  }

  drawCropPreview() {
    const canvas = this.cropCanvas?.nativeElement;
    if (!canvas || !this.cropImage.complete) return;
    const bounds = this.getCropBounds();
    const outputWidth = 900;
    const outputHeight = Math.round(outputWidth / this.getCropAspectRatio());
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    canvas.getContext('2d')?.drawImage(
      this.cropImage,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      outputWidth,
      outputHeight
    );
  }

  applyCrop() {
    if (!this.cropSourceFile || !this.cropImage.complete) return;
    const bounds = this.getCropBounds();
    const canvas = document.createElement('canvas');
    const outputWidth = 1600;
    const outputHeight = Math.round(outputWidth / this.getCropAspectRatio());
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    canvas.getContext('2d')?.drawImage(
      this.cropImage,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        this.handleError(null, 'Gagal memproses hasil crop gambar.');
        return;
      }
      const originalName = this.cropSourceFile?.name || 'cropped-image';
      const baseName = originalName.replace(/\.[^.]+$/, '');
      const croppedFile = new File([blob], `${baseName}.jpg`, {
        type: 'image/jpeg',
      });
      const kind = this.cropUploadKind;
      this.closeCropper();
      this.uploadCroppedImage(croppedFile, kind);
    }, 'image/jpeg', 0.9);
  }

  private uploadCroppedImage(file: File, kind: 'cover' | 'inline') {
    const currentSlug = this.newsForm.get('slug')?.value || this.slugify(this.newsForm.get('title')?.value || 'berita');

    this.uploadingImage = true;
    this.newsService
      .uploadImage(file, currentSlug)
      .pipe(finalize(() => (this.uploadingImage = false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.url) {
            if (kind === 'cover') {
              this.newsForm.patchValue({ image: res.url });
              this.showToast(`Gambar sampul berhasil diunggah: ${res.filename}`, 'success');
            } else {
              const fullUrl = this.getImageUrl(res.url);
              const quill = this.quillEditor?.quillEditor;
              if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', fullUrl);
                quill.setSelection(range.index + 1);
              }
              this.showToast('Gambar berhasil disisipkan ke isi berita.', 'success');
            }
          }
        },
        error: (err) => {
          this.handleError(err, kind === 'cover' ? 'Gagal mengunggah gambar sampul.' : 'Gagal mengunggah gambar inline berita.');
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
      this.openCropper(file, 'inline');
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
              if (this.isCreatePage) {
                this.router.navigate(['/admin/berita']);
              }
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
              if (this.isCreatePage) {
                this.router.navigate(['/admin/berita']);
              }
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
