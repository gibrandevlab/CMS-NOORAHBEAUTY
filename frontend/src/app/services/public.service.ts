import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AboutUsResponse } from '../models/about.model';
import { CategoryListResponse, CategoryType } from '../models/category.model';
import { NewsListResponse, NewsResponse } from '../models/news.model';
import { ProductListResponse, ProductResponse } from '../models/product.model';
import { VendorListResponse } from '../models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private readonly baseUrl = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  /** Ambil profil toko / perusahaan */
  getAbout(): Observable<AboutUsResponse> {
    return this.http.get<AboutUsResponse>(`${this.baseUrl}/about`);
  }

  /** Ambil daftar kategori publik (NEWS / PRODUCT) */
  getCategories(type?: CategoryType): Observable<CategoryListResponse> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<CategoryListResponse>(`${this.baseUrl}/categories`, { params });
  }

  /** Ambil daftar produk / layanan publik */
  getProducts(categoryId?: number): Observable<ProductListResponse> {
    let params = new HttpParams().set('is_active', 'true');
    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }
    return this.http.get<ProductListResponse>(`${this.baseUrl}/products`, { params });
  }

  /** Ambil detail produk / layanan via ID atau Slug */
  getProductBySlug(idOrSlug: string | number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/products/${idOrSlug}`);
  }

  /** Ambil daftar berita & tips kecantikan publik */
  getNews(categoryId?: number): Observable<NewsListResponse> {
    let params = new HttpParams().set('is_published', 'true');
    if (categoryId) {
      params = params.set('category_id', categoryId.toString());
    }
    return this.http.get<NewsListResponse>(`${this.baseUrl}/news`, { params });
  }

  /** Ambil detail berita & tips via ID atau Slug */
  getNewsBySlug(idOrSlug: string | number): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.baseUrl}/news/${idOrSlug}`);
  }

  /** Ambil daftar mitra vendor publik */
  getVendors(): Observable<VendorListResponse> {
    return this.http.get<VendorListResponse>(`${this.baseUrl}/vendors`);
  }
}
