import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string;
  author?: string;
  siteName?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly defaultSiteName = 'Noorah Beauty MUA';
  private readonly defaultTitle = 'Noorah Beauty MUA Semarang | Makeup Artist & Hairdo Profesional';
  private readonly defaultDescription =
    'Noorah Beauty MUA Semarang menyediakan layanan Makeup Artist, Hairdo, Photoshoot Styling, Wedding Makeup, dan Custom Press-on Nails.';
  private readonly defaultImage = 'assets/images/LOGO NB.png';
  private readonly defaultUrl = 'https://noorahbeauty.biz.id/';

  constructor(
    private readonly titleService: Title,
    private readonly metaService: Meta,
    @Inject(DOCUMENT) private readonly doc: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  /**
   * Perbarui meta tags (Standard, Open Graph, Twitter Card, Canonical URL)
   */
  updateTags(config: SeoConfig = {}): void {
    const rawTitle = config.title?.trim();
    const title = rawTitle ? `${rawTitle} | ${this.defaultSiteName}` : this.defaultTitle;
    const description = config.description?.trim() || this.defaultDescription;
    const siteName = config.siteName || this.defaultSiteName;
    const type = config.type || 'website';
    const url = config.url || this.getCurrentUrl();
    const image = this.formatAbsoluteImageUrl(config.image || this.defaultImage);

    // Update Browser Document Title
    this.titleService.setTitle(title);

    // Standard Meta Tags
    this.updateOrAddMeta('name', 'description', description);
    if (config.keywords) {
      this.updateOrAddMeta('name', 'keywords', config.keywords);
    }
    if (config.author) {
      this.updateOrAddMeta('name', 'author', config.author);
    }

    // Open Graph Tags
    this.updateOrAddMeta('property', 'og:site_name', siteName);
    this.updateOrAddMeta('property', 'og:title', title);
    this.updateOrAddMeta('property', 'og:description', description);
    this.updateOrAddMeta('property', 'og:image', image);
    this.updateOrAddMeta('property', 'og:url', url);
    this.updateOrAddMeta('property', 'og:type', type);

    // Twitter Card Tags
    this.updateOrAddMeta('name', 'twitter:card', 'summary_large_image');
    this.updateOrAddMeta('name', 'twitter:title', title);
    this.updateOrAddMeta('name', 'twitter:description', description);
    this.updateOrAddMeta('name', 'twitter:image', image);

    // Canonical URL
    this.updateCanonicalUrl(url);
  }

  /**
   * Sisipkan atau perbarui Structured Data (JSON-LD) di <head>
   */
  setJsonLdSchema(schema: object | object[]): void {
    const scriptId = 'json-ld-schema';
    let scriptElement = this.doc.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = this.doc.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      this.doc.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(schema);
  }

  /**
   * Generasi Schema BreadcrumbList
   */
  setBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]): void {
    const itemListElement = breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: this.formatAbsoluteUrl(item.url),
    }));

    this.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    });
  }

  private updateOrAddMeta(attrName: 'name' | 'property', attrValue: string, content: string): void {
    const selector = `${attrName}="${attrValue}"`;
    if (this.metaService.getTag(selector)) {
      this.metaService.updateTag({ [attrName]: attrValue, content });
    } else {
      this.metaService.addTag({ [attrName]: attrValue, content });
    }
  }

  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId) && window?.location?.href) {
      return window.location.href;
    }
    return this.defaultUrl;
  }

  private formatAbsoluteUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const origin = isPlatformBrowser(this.platformId) && window?.location?.origin
      ? window.location.origin
      : 'https://noorahbeauty.biz.id';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${origin}${cleanPath}`;
  }

  private formatAbsoluteImageUrl(imagePath: string): string {
    if (!imagePath) return `${this.defaultUrl}${this.defaultImage}`;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const origin = isPlatformBrowser(this.platformId) && window?.location?.origin
      ? window.location.origin
      : 'https://noorahbeauty.biz.id';
    const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    return `${origin}${cleanPath}`;
  }
}
