import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalNews: number;
  totalProducts: number;
  totalCategories: number;
  totalVendors: number;
}

interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
}

const EMPTY_STATS: DashboardStats = {
  totalNews: 0,
  totalProducts: 0,
  totalCategories: 0,
  totalVendors: 0,
};

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = `${environment.apiUrl}/admin/dashboard`;

  private static readonly STORAGE_KEY = 'cms_dashboard_stats_cache';

  /** Cache data terakhir yang berhasil diambil */
  private readonly _cache = new BehaviorSubject<DashboardStats | null>(this.loadFromStorage());

  /** Observable cache — komponen bisa langsung baca data lama dari sini */
  readonly cachedStats$ = this._cache.asObservable();

  /** true jika cache sudah pernah diisi setidaknya sekali */
  get hasCachedData(): boolean {
    return this._cache.value !== null;
  }

  /** Nilai cache saat ini (sinkron) */
  get cachedStats(): DashboardStats {
    return this._cache.value ?? EMPTY_STATS;
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): DashboardStats | null {
    try {
      const saved = localStorage.getItem(DashboardService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  getStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/stats`).pipe(
      tap((response) => {
        if (response?.data) {
          this._cache.next(response.data);
          try {
            localStorage.setItem(DashboardService.STORAGE_KEY, JSON.stringify(response.data));
          } catch {}
        }
      })
    );
  }
}
