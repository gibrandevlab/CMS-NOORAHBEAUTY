import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateNewsDto,
  News,
  NewsListResponse,
  NewsResponse,
  UpdateNewsDto,
  UploadImageResponse,
} from '../models/news.model';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/news`;
  private readonly publicApiUrl = `${environment.apiUrl}/news`;
  private readonly uploadApiUrl = `${environment.apiUrl}/admin/upload`;

  private static readonly STORAGE_KEY = 'cms_berita_cache';

  /** Cache data berita terakhir */
  private readonly _cache = new BehaviorSubject<News[] | null>(this.loadFromStorage());

  /** Observable cache data berita */
  readonly cachedNews$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && this._cache.value.length >= 0;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedNews(): News[] {
    return this._cache.value ?? [];
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): News[] | null {
    try {
      const saved = localStorage.getItem(NewsService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(newsList: News[]): void {
    this._cache.next(newsList);
    try {
      localStorage.setItem(NewsService.STORAGE_KEY, JSON.stringify(newsList));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil semua berita (opsional filter berdasarkan category_id atau is_published)
   */
  getNews(categoryId?: number, isPublished?: boolean): Observable<NewsListResponse> {
    let params = new HttpParams();
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('category_id', categoryId.toString());
    }
    if (isPublished !== undefined && isPublished !== null) {
      params = params.set('is_published', isPublished.toString());
    }

    return this.http.get<NewsListResponse>(this.adminApiUrl, { params }).pipe(
      tap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengambil detail berita berdasarkan ID atau Slug
   */
  getNewsByIdOrSlug(idOrSlug: string | number): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.publicApiUrl}/${idOrSlug}`);
  }

  /**
   * Menambah berita baru
   */
  createNews(dto: CreateNewsDto): Observable<NewsResponse> {
    return this.http.post<NewsResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const current = this.cachedNews;
          this.updateCache([response.data, ...current]);
        }
      })
    );
  }

  /**
   * Mengubah data berita
   */
  updateNews(id: number, dto: UpdateNewsDto): Observable<NewsResponse> {
    return this.http.put<NewsResponse>(`${this.publicApiUrl}/${id}`, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const updatedList = this.cachedNews.map((item) =>
            item.id === id ? response.data : item
          );
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Menghapus berita beserta file gambar fisiknya di server
   */
  deleteNews(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.publicApiUrl}/${id}`).pipe(
      tap((response) => {
        if (response?.success) {
          const updatedList = this.cachedNews.filter((item) => item.id !== id);
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Quick toggle status publikasi berita
   */
  togglePublishStatus(id: number, currentStatus: boolean): Observable<NewsResponse> {
    return this.updateNews(id, { is_published: !currentStatus });
  }

  /**
   * Upload file gambar ke backend (Otomatis dinamai slugberita#index.ext oleh backend)
   */
  uploadImage(file: File, slug?: string): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (slug) {
      formData.append('slug', slug);
    }

    return this.http.post<UploadImageResponse>(this.uploadApiUrl, formData);
  }
}
