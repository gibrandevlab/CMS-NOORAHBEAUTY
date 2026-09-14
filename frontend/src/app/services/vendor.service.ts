import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateVendorDto,
  UpdateVendorDto,
  Vendor,
  VendorListResponse,
  VendorResponse,
} from '../models/vendor.model';
import { UploadImageResponse } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/vendors`;
  private readonly publicApiUrl = `${environment.apiUrl}/vendors`;
  private readonly uploadApiUrl = `${environment.apiUrl}/admin/upload`;

  private static readonly STORAGE_KEY = 'cms_vendor_cache';

  /** Cache data vendor terakhir */
  private readonly _cache = new BehaviorSubject<Vendor[] | null>(this.loadFromStorage());

  /** Observable cache data vendor */
  readonly cachedVendors$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && this._cache.value.length > 0;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedVendors(): Vendor[] {
    return this._cache.value ?? [];
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Vendor[] | null {
    try {
      const saved = localStorage.getItem(VendorService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(vendors: Vendor[]): void {
    this._cache.next(vendors);
    try {
      localStorage.setItem(VendorService.STORAGE_KEY, JSON.stringify(vendors));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil semua vendor (dengan fallback ke public API)
   */
  getVendors(): Observable<VendorListResponse> {
    return this.http.get<VendorListResponse>(this.adminApiUrl).pipe(
      catchError(() => this.http.get<VendorListResponse>(this.publicApiUrl)),
      tap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengambil detail vendor berdasarkan ID
   */
  getVendorById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(`${this.publicApiUrl}/${id}`);
  }

  /**
   * Menambah vendor baru
   */
  createVendor(dto: CreateVendorDto): Observable<VendorResponse> {
    return this.http.post<VendorResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const current = this.cachedVendors;
          this.updateCache([response.data, ...current]);
        }
      })
    );
  }

  /**
   * Mengubah data vendor
   */
  updateVendor(id: number, dto: UpdateVendorDto): Observable<VendorResponse> {
    return this.http.put<VendorResponse>(`${this.adminApiUrl}/${id}`, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const updatedList = this.cachedVendors.map((item) =>
            item.id === id ? response.data : item
          );
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Menghapus vendor
   */
  deleteVendor(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.adminApiUrl}/${id}`).pipe(
      tap((response) => {
        if (response?.success) {
          const updatedList = this.cachedVendors.filter((item) => item.id !== id);
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Upload logo vendor ke backend
   */
  uploadLogo(file: File | Blob): Observable<UploadImageResponse> {
    const formData = new FormData();
    const fileName = (file as File).name || 'logo.jpg';
    formData.append('image', file, fileName);

    return this.http.post<UploadImageResponse>(this.uploadApiUrl, formData);
  }
}
