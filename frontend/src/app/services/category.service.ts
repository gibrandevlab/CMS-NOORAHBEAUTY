import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Category,
  CategoryListResponse,
  CategoryResponse,
  CategoryType,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/categories`;
  private readonly publicApiUrl = `${environment.apiUrl}/categories`;

  private static readonly STORAGE_KEY = 'cms_kategori_jasa_cache';

  /** Cache data kategori terakhir */
  private readonly _cache = new BehaviorSubject<Category[] | null>(this.loadFromStorage());

  /** Observable cache data kategori */
  readonly cachedCategories$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && this._cache.value.length >= 0;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedCategories(): Category[] {
    return this._cache.value ?? [];
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Category[] | null {
    try {
      const saved = localStorage.getItem(CategoryService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(categories: Category[]): void {
    this._cache.next(categories);
    try {
      localStorage.setItem(CategoryService.STORAGE_KEY, JSON.stringify(categories));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil semua kategori (bisa difilter berdasarkan type: 'NEWS' atau 'PRODUCT')
   */
  getCategories(type?: CategoryType): Observable<CategoryListResponse> {
    const url = type ? `${this.adminApiUrl}?type=${type}` : this.adminApiUrl;
    return this.http.get<CategoryListResponse>(url).pipe(
      tap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengambil detail kategori berdasarkan ID
   */
  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.publicApiUrl}/${id}`);
  }

  /**
   * Menambah kategori baru
   */
  createCategory(dto: CreateCategoryDto): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const current = this.cachedCategories;
          this.updateCache([response.data, ...current]);
        }
      })
    );
  }

  /**
   * Mengubah data kategori
   */
  updateCategory(id: number, dto: UpdateCategoryDto): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(`${this.publicApiUrl}/${id}`, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const updatedList = this.cachedCategories.map((item) =>
            item.id === id ? response.data : item
          );
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Menghapus kategori
   */
  deleteCategory(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.publicApiUrl}/${id}`).pipe(
      tap((response) => {
        if (response?.success) {
          const updatedList = this.cachedCategories.filter((item) => item.id !== id);
          this.updateCache(updatedList);
        }
      })
    );
  }
}
