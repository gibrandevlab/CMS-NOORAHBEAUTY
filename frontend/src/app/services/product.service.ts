import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateProductDto,
  Product,
  ProductListResponse,
  ProductResponse,
  UpdateProductDto,
} from '../models/product.model';

export interface UploadImageResponse {
  success: boolean;
  message?: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/products`;
  private readonly publicApiUrl = `${environment.apiUrl}/products`;
  private readonly uploadApiUrl = `${environment.apiUrl}/admin/upload`;

  private static readonly STORAGE_KEY = 'cms_jasa_cache';

  /** Cache data jasa / produk terakhir */
  private readonly _cache = new BehaviorSubject<Product[] | null>(this.loadFromStorage());

  /** Observable cache data jasa / produk */
  readonly cachedProducts$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && this._cache.value.length > 0;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedProducts(): Product[] {
    return this._cache.value ?? [];
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Product[] | null {
    try {
      const saved = localStorage.getItem(ProductService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(products: Product[]): void {
    this._cache.next(products);
    try {
      localStorage.setItem(ProductService.STORAGE_KEY, JSON.stringify(products));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil semua produk/jasa (opsional filter berdasarkan category_id atau is_active)
   * Menggunakan fallback ke public endpoint jika admin endpoint tidak memiliki akses
   */
  getProducts(categoryId?: number, isActive?: boolean): Observable<ProductListResponse> {
    let params = new HttpParams();
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('category_id', categoryId.toString());
    }
    if (isActive !== undefined && isActive !== null) {
      params = params.set('is_active', isActive.toString());
    }

    return this.http.get<ProductListResponse>(this.adminApiUrl, { params }).pipe(
      catchError(() => this.http.get<ProductListResponse>(this.publicApiUrl, { params })),
      tap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengambil detail produk berdasarkan ID atau Slug
   */
  getProductByIdOrSlug(idOrSlug: string | number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.publicApiUrl}/${idOrSlug}`);
  }

  /**
   * Menambah produk/jasa baru
   */
  createProduct(dto: CreateProductDto): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const current = this.cachedProducts;
          this.updateCache([response.data, ...current]);
        }
      })
    );
  }

  /**
   * Mengubah data produk/jasa
   */
  updateProduct(id: number, dto: UpdateProductDto): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.adminApiUrl}/${id}`, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const updatedList = this.cachedProducts.map((item) =>
            item.id === id ? response.data : item
          );
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Menghapus produk/jasa
   */
  deleteProduct(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.adminApiUrl}/${id}`).pipe(
      tap((response) => {
        if (response?.success) {
          const updatedList = this.cachedProducts.filter((item) => item.id !== id);
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Toggle status aktif/non-aktif produk
   */
  toggleActiveStatus(id: number, currentStatus: boolean): Observable<ProductResponse> {
    return this.updateProduct(id, { is_active: !currentStatus });
  }

  /**
   * Upload file gambar ke backend
   */
  uploadImage(file: File | Blob, slug?: string): Observable<UploadImageResponse> {
    const formData = new FormData();
    const fileName = (file as File).name || 'image.jpg';
    if (slug) {
      formData.append('slug', slug);
    }
    formData.append('image', file, fileName);

    return this.http.post<UploadImageResponse>(this.uploadApiUrl, formData);
  }
}
