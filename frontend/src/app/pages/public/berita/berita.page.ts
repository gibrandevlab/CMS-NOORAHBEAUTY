import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/category.model';
import { News } from '../../../models/news.model';
import { PublicService } from '../../../services/public.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-public-berita',
  templateUrl: './berita.page.html',
  styleUrls: ['./berita.page.scss'],
  standalone: false,
})
export class BeritaPage implements OnInit, ViewWillEnter {
  private readonly publicService = inject(PublicService);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  newsList: News[] = [];
  loading = true;
  errorMessage = '';

  searchQuery = '';
  selectedCategory: number | 'ALL' = 'ALL';

  // Pagination State (Fitur Halaman / Page)
  currentPage = 1;
  itemsPerPage = 6;

  // Detail View State
  selectedArticle: News | null = null;
  isDetailMode = false;

  ngOnInit() {
    this.loadCategories();
    this.loadNews();

    // Cek jika rute diakses via /berita/:slug
    this.route.params.subscribe((params) => {
      if (params['slug']) {
        this.loadNewsDetailBySlug(params['slug']);
      } else {
        this.isDetailMode = false;
        this.selectedArticle = null;
        this.seoService.updateTags({
          title: 'Berita & Beauty Tips - Noorah Beauty MUA',
          description:
            'Artikel kecantikan, tips makeup, tren hairdo, dan informasi terbaru dari Noorah Beauty MUA Semarang.',
          type: 'website',
        });
        this.seoService.setBreadcrumbSchema([
          { name: 'Beranda', url: '/beranda' },
          { name: 'Tips & Portofolio', url: '/berita' },
        ]);
        this.cdr.markForCheck();
      }
    });
  }

  ionViewWillEnter() {
    this.loadCategories();
    this.loadNews();
  }

  loadCategories() {
    this.publicService.getCategories('NEWS').subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.categories = res.data;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });
  }

  loadNews() {
    this.loading = true;
    this.errorMessage = '';
    this.publicService.getNews().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.newsList = res.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Gagal memuat daftar berita & tips.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadNewsDetailBySlug(slug: string) {
    this.loading = true;
    this.publicService.getNewsBySlug(slug).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.selectedArticle = res.data;
          this.isDetailMode = true;

          // Dynamic Meta Tags & Structured Data untuk Detail Artikel
          const excerpt = this.getExcerpt(res.data.content, 150);
          const imageUrl = this.getImageUrl(res.data.image);

          this.seoService.updateTags({
            title: res.data.title,
            description: excerpt,
            image: imageUrl,
            type: 'article',
          });

          this.seoService.setBreadcrumbSchema([
            { name: 'Beranda', url: '/beranda' },
            { name: 'Tips & Portofolio', url: '/berita' },
            { name: res.data.title, url: `/berita/${res.data.slug}` },
          ]);

          this.seoService.setJsonLdSchema({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: res.data.title,
            description: excerpt,
            image: [imageUrl],
            datePublished: res.data.createdAt || res.data.created_at,
            author: {
              '@type': 'Organization',
              name: 'Noorah Beauty MUA',
            },
          });
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isDetailMode = false;
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get filteredNews(): News[] {
    let result = this.newsList;

    if (this.selectedCategory !== 'ALL') {
      const catId = Number(this.selectedCategory);
      result = result.filter((n) => n.category_id === catId);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          (n.category?.name && n.category.name.toLowerCase().includes(query))
      );
    }

    return result;
  }

  get pagedNews(): News[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNews.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredNews.length / this.itemsPerPage) || 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.markForCheck();
    }
  }

  filterByCategory(catId: number | 'ALL') {
    this.selectedCategory = catId;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  openArticleDetail(article: News) {
    this.router.navigate(['/berita', article.slug]);
  }

  backToList() {
    this.router.navigate(['/berita']);
  }

  getReadingTime(content?: string): number {
    if (!content) return 2;
    const words = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  getRelatedArticles(currentId: number): News[] {
    return this.newsList.filter((n) => n.id !== currentId).slice(0, 3);
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return 'assets/img/news-placeholder.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      if (imagePath.includes('#') && imagePath.includes('/uploads/')) {
        return imagePath.replace(/#/g, '%23');
      }
      return imagePath;
    }
    const backendBase = environment.apiUrl.replace(/\/api$/, '');
    const encodedPath = imagePath
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return `${backendBase}${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`;
  }

  processContentImageUrls(htmlContent: string | null | undefined): string {
    if (!htmlContent) return '';
    const backendBase = environment.apiUrl.replace(/\/api$/, '');

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

  getExcerpt(htmlContent: string | null | undefined, maxLength = 120): string {
    if (!htmlContent) return '-';
    const textContent = new DOMParser().parseFromString(htmlContent, 'text/html').body.textContent || '';
    const plainText = textContent.replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  getSanitizedHtml(htmlContent: string | null | undefined): SafeHtml {
    const processedHtml = this.processContentImageUrls(htmlContent);
    return this.sanitizer.bypassSecurityTrustHtml(processedHtml);
  }

  getWhatsAppUrl(itemTitle?: string): string {
    const cleanPhone = '6285869187340';
    const title = itemTitle || this.selectedArticle?.title || 'Artikel Noorah Beauty';
    const message = `Halo Noorah Beauty MUA, saya ingin bertanya / berkonsultasi mengenai artikel "${title}".`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
