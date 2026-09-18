import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { AboutUs } from '../../../models/about.model';
import { Category } from '../../../models/category.model';
import { News } from '../../../models/news.model';
import { Product } from '../../../models/product.model';
import { Vendor } from '../../../models/vendor.model';
import { PublicService } from '../../../services/public.service';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-public-beranda',
  templateUrl: './beranda.page.html',
  styleUrls: ['./beranda.page.scss'],
  standalone: false,
})
export class BerandaPage implements OnInit, ViewWillEnter {
  private readonly publicService = inject(PublicService);
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  aboutInfo: AboutUs | null = null;
  productCategories: Category[] = [];
  products: Product[] = [];
  newsList: News[] = [];
  vendors: Vendor[] = [];

  // Derived lists for specific sections
  portfolioNews: News[] = [];
  articleNews: News[] = [];

  loading = true;

  // Highlights Kategori Static & Dynamic
  categoryHighlights = [
    { name: 'Makeup Artist', icon: 'sparkles-outline', type: 'MAKEUP' },
    { name: 'Hairdo Styling', icon: 'cut-outline', type: 'HAIRDO' },
    { name: 'Press-on Nails', icon: 'hand-left-outline', type: 'NAILS' },
    { name: 'Photoshoot', icon: 'camera-outline', type: 'PHOTOSHOOT' },
    { name: 'Wedding & Event', icon: 'heart-outline', type: 'WEDDING' },
  ];

  ngOnInit() {
    this.loadAllStorefrontData();
  }

  ionViewWillEnter() {
    this.loadAllStorefrontData();
  }

  loadAllStorefrontData() {
    this.loading = true;

    // Set Meta Tags & Schema.org untuk Beranda
    this.seoService.updateTags({
      title: 'Beranda - Makeup Artist & Hairdo Profesional',
      description:
        'Noorah Beauty MUA Semarang menyediakan layanan Makeup Artist, Hairdo, Photoshoot Styling, Wedding Makeup, dan Custom Press-on Nails.',
      type: 'website',
      keywords: 'MUA Semarang, Makeup Artist Semarang, Hairdo Semarang, Wedding Makeup, Press-on Nails, Noorah Beauty',
    });

    this.seoService.setBreadcrumbSchema([
      { name: 'Beranda', url: '/beranda' },
    ]);

    this.seoService.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      name: 'Noorah Beauty MUA',
      description: 'Layanan Makeup Artist, Hairdo, & Custom Press-on Nails Profesional di Semarang.',
      url: 'https://noorahbeauty.biz.id',
      telephone: '+6285869187340',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Semarang',
        addressRegion: 'Jawa Tengah',
        addressCountry: 'ID',
      },
    });

    // Load Profil Toko
    this.publicService.getAbout().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.aboutInfo = res.data;
          this.cdr.markForCheck();
        }
      },
    });

    // Load Kategori Produk
    this.publicService.getCategories('PRODUCT').subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.productCategories = res.data;
          this.cdr.markForCheck();
        }
      },
    });

    // Load Produk & Layanan (Max 6 untuk Beranda, tipe = PRODUCT)
    this.publicService.getProducts().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.products = res.data.filter(
            (p) => !p.category?.type || p.category.type.toUpperCase() === 'PRODUCT'
          );
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    // Load Berita & Tips (Max 3-5 untuk Beranda)
    this.publicService.getNews().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.newsList = res.data;
          this.updateDerivedNews();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.cdr.markForCheck();
      },
    });

    // Load Vendor Partner
    this.publicService.getVendors().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.vendors = res.data;
          this.cdr.markForCheck();
        }
      },
    });
  }

  // Filter news into portfolio and article sections
  private updateDerivedNews(): void {
    if (!this.newsList || this.newsList.length === 0) {
      this.portfolioNews = [];
      this.articleNews = [];
      return;
    }

    // Sort by newest first
    const sorted = [...this.newsList].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Section Portofolio: Tampilkan data berita yang berelasi dengan kategori "Portofolio" (tipe news)
    this.portfolioNews = sorted
      .filter((n) => n.category?.name?.trim().toLowerCase() === 'portofolio')
      .slice(0, 5);

    // Section ARTIKEL & TIPS / Beauty Guide & Informasi: Tampilkan data berita dengan tipe news, kecuali kategori yang bernama "Portofolio"
    this.articleNews = sorted
      .filter(
        (n) =>
          n.category?.name?.trim().toLowerCase() !== 'portofolio' &&
          (!n.category?.type || n.category.type.toUpperCase() === 'NEWS')
      )
      .slice(0, 5);

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

  getExcerpt(htmlContent: string | null | undefined, maxLength = 110): string {
    if (!htmlContent) return '-';
    const textContent = new DOMParser().parseFromString(htmlContent, 'text/html').body.textContent || '';
    const plainText = textContent.replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }

  getSanitizedHtml(htmlContent: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent || '');
  }

  getWhatsAppUrl(itemTitle?: string): string {
    const cleanPhone = '6285869187340';
    const message = itemTitle
      ? `Halo Noorah Beauty MUA, saya tertarik untuk memesan / berkonsultasi mengenai layanan "${itemTitle}".`
      : 'Halo Noorah Beauty MUA, saya ingin berkonsultasi mengenai jadwal & price list Makeup Artist / Hairdo.';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
