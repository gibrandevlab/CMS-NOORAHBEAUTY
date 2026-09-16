import { Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateSeo(event.urlAfterRedirects));

    this.updateSeo(this.router.url);
  }

  private updateSeo(url: string): void {
    const path = url.split('?')[0].replace(/\/$/, '') || '/beranda';
    const seoByPath: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'Noorah Beauty MUA Semarang | Makeup Artist & Hairdo Profesional',
        description: 'Noorah Beauty MUA Semarang menyediakan layanan Makeup Artist, Hairdo, Photoshoot Styling, Wedding Makeup, dan Custom Press-on Nails.',
      },
      '/beranda': {
        title: 'Noorah Beauty MUA Semarang | Makeup Artist & Hairdo Profesional',
        description: 'Makeup Artist dan Hairdo profesional untuk wedding, graduation, photoshoot, dan event di Semarang.',
      },
      '/katalog-jasa': {
        title: 'Katalog Jasa MUA & Hairdo Semarang | Noorah Beauty',
        description: 'Lihat pilihan layanan Makeup Artist, Hairdo Styling, dan Custom Press-on Nails dari Noorah Beauty MUA Semarang.',
      },
      '/berita': {
        title: 'Tips Makeup, Hairdo & Kecantikan | Noorah Beauty MUA',
        description: 'Artikel dan tips makeup, perawatan kulit, hairdo, serta inspirasi kecantikan dari Noorah Beauty MUA.',
      },
    };
    const seo = seoByPath[path] || (path.startsWith('/berita/')
      ? { title: 'Artikel Kecantikan | Noorah Beauty MUA', description: 'Baca artikel dan inspirasi kecantikan dari Noorah Beauty MUA Semarang.' }
      : path.startsWith('/katalog-jasa/')
        ? { title: 'Detail Layanan MUA | Noorah Beauty', description: 'Detail layanan Makeup Artist, Hairdo, dan kecantikan dari Noorah Beauty MUA Semarang.' }
        : seoByPath['/beranda']);
    const canonicalUrl = `https://noorahbeauty.biz.id${path === '/' ? '/beranda' : path}`;

    this.title.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }
}
