import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AboutUs } from '../../models/about.model';
import { PublicService } from '../../services/public.service';

@Component({
  selector: 'app-public-layout',
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PublicLayoutComponent implements OnInit {
  protected readonly Math = Math;

  private readonly publicService = inject(PublicService);

  aboutInfo: AboutUs | null = null;
  isMenuOpen = false;

  ngOnInit() {
    this.fetchAboutInfo();
  }

  fetchAboutInfo() {
    this.publicService.getAbout().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.aboutInfo = res.data;
        }
      },
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  getWhatsAppUrl(customMessage?: string): string {
    const cleanPhone = '6285869187340';
    const message = customMessage || 'Halo Noorah Beauty MUA, saya tertarik untuk bertanya mengenai layanan Makeup Artist & Hairdo.';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
