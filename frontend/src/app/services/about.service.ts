import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AboutUs, AboutUsResponse, UpdateAboutUsDto } from '../models/about.model';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/about`;
  private readonly publicApiUrl = `${environment.apiUrl}/about`;

  private static readonly STORAGE_KEY = 'cms_about_cache';

  /** Cache data profil tentang kami terakhir */
  private readonly _cache = new BehaviorSubject<AboutUs | null>(this.loadFromStorage());

  /** Observable cache data tentang kami */
  readonly cachedAbout$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && !!this._cache.value.company_name;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedAbout(): AboutUs | null {
    return this._cache.value;
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): AboutUs | null {
    try {
      const saved = localStorage.getItem(AboutService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(aboutData: AboutUs): void {
    this._cache.next(aboutData);
    try {
      localStorage.setItem(AboutService.STORAGE_KEY, JSON.stringify(aboutData));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil profil tentang kami (dengan fallback ke public API)
   */
  getAbout(): Observable<AboutUsResponse> {
    return this.http.get<AboutUsResponse>(this.adminApiUrl).pipe(
      catchError(() => this.http.get<AboutUsResponse>(this.publicApiUrl)),
      tap((response) => {
        if (response?.success && response.data) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengubah profil tentang kami
   */
  updateAbout(dto: UpdateAboutUsDto): Observable<AboutUsResponse> {
    return this.http.put<AboutUsResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          this.updateCache(response.data);
        }
      })
    );
  }
}
