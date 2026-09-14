import { Component, inject, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  stats: DashboardStats = {
    totalNews: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalVendors: 0,
  };

  /**
   * loading = true HANYA saat tidak ada cache sama sekali (kunjungan pertama).
   * Jika cache sudah ada di service, langsung tampil data tanpa skeleton.
   */
  loading = false;

  /** Berputar halus di tombol saat refresh background */
  refreshing = false;

  errorMessage = '';

  ngOnInit() {
    if (this.dashboardService.hasCachedData) {
      // Ada cache (navigasi balik) → tampilkan data langsung, refresh diam-diam
      this.stats = { ...this.dashboardService.cachedStats };
      this.loading = false;
      this.silentRefresh();
    } else {
      // Belum ada cache (kunjungan pertama / baru login) → tampilkan skeleton
      this.loading = true;
      this.fetchStats();
    }
  }

  /** Fetch awal: tampilkan skeleton penuh, sembunyikan saat selesai */
  private fetchStats() {
    this.errorMessage = '';
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats = {
            totalNews: response.data.totalNews ?? 0,
            totalProducts: response.data.totalProducts ?? 0,
            totalCategories: response.data.totalCategories ?? 0,
            totalVendors: response.data.totalVendors ?? 0,
          };
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.status === 401
          ? 'Sesi login sudah berakhir. Silakan login kembali.'
          : 'Statistik dashboard gagal dimuat. Pastikan backend berjalan.';
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam: data lama tetap tampil, hanya ikon ↻ berputar */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats = {
            totalNews: response.data.totalNews ?? 0,
            totalProducts: response.data.totalProducts ?? 0,
            totalCategories: response.data.totalCategories ?? 0,
            totalVendors: response.data.totalVendors ?? 0,
          };
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Dipanggil tombol Perbarui atau pull-to-refresh */
  loadStats(event?: any) {
    if (event) {
      this.dashboardService.getStats().subscribe({
        next: (response) => {
          if (response?.data) {
            this.stats = {
              totalNews: response.data.totalNews ?? 0,
              totalProducts: response.data.totalProducts ?? 0,
              totalCategories: response.data.totalCategories ?? 0,
              totalVendors: response.data.totalVendors ?? 0,
            };
          }
          this.errorMessage = '';
          event.target.complete();
        },
        error: (error) => {
          this.errorMessage = error.status === 401
            ? 'Sesi login sudah berakhir.'
            : 'Gagal memperbarui statistik.';
          event.target.complete();
        },
      });
    } else {
      this.silentRefresh();
    }
  }
}
