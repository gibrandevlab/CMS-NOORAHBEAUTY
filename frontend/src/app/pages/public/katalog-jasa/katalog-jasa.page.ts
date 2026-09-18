import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Category } from '../../../models/category.model';
import { Product } from '../../../models/product.model';
import { PublicService } from '../../../services/public.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-public-katalog-jasa',
  templateUrl: './katalog-jasa.page.html',
  styleUrls: ['./katalog-jasa.page.scss'],
  standalone: false,
})
export class KatalogJasaPage implements OnInit, ViewWillEnter {
  private readonly publicService = inject(PublicService);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  products: Product[] = [];
  loading = true;
  errorMessage = '';

  // Filter & Search State
  searchQuery = '';
  selectedCategory: number | 'ALL' = 'ALL';

  // Pagination State (Fitur Halaman / Page)
  currentPage = 1;
  itemsPerPage = 6;

  // Detail Modal State
  selectedProduct: Product | null = null;
  isDetailOpen = false;

  ngOnInit() {
    this.setDefaultSeo();
    this.loadCategories();
    this.loadProducts();

    // Cek rute slug jika diakses langsung via /katalog-jasa/:slug
    this.route.params.subscribe((params) => {
      if (params['slug']) {
        this.loadProductDetailBySlug(params['slug']);
      }
    });
  }

  ionViewWillEnter() {
    this.setDefaultSeo();
    this.loadCategories();
    this.loadProducts();
  }

  private setDefaultSeo() {
    this.seoService.updateTags({
      title: 'Katalog Jasa & Press-on Nails - Noorah Beauty MUA',
      description:
        'Katalog lengkap layanan Makeup Artist (Wedding, Graduation, Photoshoot, Event) & Custom Press-on Nails Semarang.',
      type: 'website',
    });
    this.seoService.setBreadcrumbSchema([
      { name: 'Beranda', url: '/beranda' },
      { name: 'Katalog Jasa & Nails', url: '/katalog-jasa' },
    ]);
  }

  loadCategories() {
    this.publicService.getCategories('PRODUCT').subscribe({
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

  loadProducts() {
    this.loading = true;
    this.errorMessage = '';
    this.publicService.getProducts().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.products = res.data;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Gagal memuat katalog jasa & produk.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadProductDetailBySlug(slug: string) {
    this.publicService.getProductBySlug(slug).subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.selectedProduct = res.data;
          this.isDetailOpen = true;
          this.updateProductSeo(res.data);
          this.cdr.markForCheck();
        }
      },
    });
  }

  openProductDetail(product: Product) {
    this.selectedProduct = product;
    this.isDetailOpen = true;
    this.updateProductSeo(product);
    this.cdr.markForCheck();
  }

  closeDetailModal() {
    this.isDetailOpen = false;
    this.selectedProduct = null;
    this.setDefaultSeo();
    this.cdr.markForCheck();
  }

  private updateProductSeo(product: Product) {
    const priceText = this.formatPrice(product.price);
    const description =
      product.description || `Layanan ${product.name} dari Noorah Beauty MUA Semarang (${priceText}).`;
    const imageUrl = this.getImageUrl(product.image);

    this.seoService.updateTags({
      title: `${product.name} - ${priceText}`,
      description: description,
      image: imageUrl,
      type: 'product',
    });

    this.seoService.setBreadcrumbSchema([
      { name: 'Beranda', url: '/beranda' },
      { name: 'Katalog Jasa & Nails', url: '/katalog-jasa' },
      { name: product.name, url: `/katalog-jasa/${product.slug || product.id}` },
    ]);

    this.seoService.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: description,
      image: [imageUrl],
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IDR',
        price: product.price || 0,
        availability: 'https://schema.org/InStock',
      },
    });
  }

  get filteredProducts(): Product[] {
    let result = this.products;

    if (this.selectedCategory !== 'ALL') {
      const catId = Number(this.selectedCategory);
      result = result.filter((p) => p.category_id === catId);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(query))
      );
    }

    return result;
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.itemsPerPage) || 1;
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

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return 'assets/img/news-placeholder.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const backendBase = environment.apiUrl.replace(/\/api$/, '');
    const encodedPath = imagePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `${backendBase}${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`;
  }

  formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined || price === '') return 'Hubungi Kami';
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) return 'Hubungi Kami';
    return 'Rp ' + numPrice.toLocaleString('id-ID');
  }

  getWhatsAppUrl(itemTitle?: string): string {
    const cleanPhone = '6285869187340';
    const title = itemTitle || this.selectedProduct?.name || 'Katalog Jasa & Nails';
    const message = `Halo Noorah Beauty MUA, saya ingin berkonsultasi / memesan layanan "${title}". Mohon info ketersediaan jadwal.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
