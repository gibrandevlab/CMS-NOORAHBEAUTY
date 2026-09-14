import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  UserListResponse,
  UserResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly adminApiUrl = `${environment.apiUrl}/admin/users`;
  private static readonly STORAGE_KEY = 'cms_user_cache';

  /** Cache data user admin terakhir */
  private readonly _cache = new BehaviorSubject<User[] | null>(this.loadFromStorage());

  /** Observable cache data user admin */
  readonly cachedUsers$ = this._cache.asObservable();

  /** Status apakah sudah ada data tersimpan di cache */
  get hasCachedData(): boolean {
    return this._cache.value !== null && this._cache.value.length > 0;
  }

  /** Mengambil data cache saat ini secara sinkron */
  get cachedUsers(): User[] {
    return this._cache.value ?? [];
  }

  constructor(private http: HttpClient) {}

  private loadFromStorage(): User[] | null {
    try {
      const saved = localStorage.getItem(UserService.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private updateCache(users: User[]): void {
    this._cache.next(users);
    try {
      localStorage.setItem(UserService.STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Abaikan error kuota localStorage
    }
  }

  /**
   * Mengambil semua user admin
   */
  getUsers(): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(this.adminApiUrl).pipe(
      tap((response) => {
        if (response?.success && Array.isArray(response.data)) {
          this.updateCache(response.data);
        }
      })
    );
  }

  /**
   * Mengambil detail user berdasarkan ID
   */
  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.adminApiUrl}/${id}`);
  }

  /**
   * Menambah user admin baru
   */
  createUser(dto: CreateUserDto): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.adminApiUrl, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const current = this.cachedUsers;
          this.updateCache([response.data, ...current]);
        }
      })
    );
  }

  /**
   * Mengubah data user admin
   */
  updateUser(id: number, dto: UpdateUserDto): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.adminApiUrl}/${id}`, dto).pipe(
      tap((response) => {
        if (response?.success && response.data) {
          const updatedList = this.cachedUsers.map((item) =>
            item.id === id ? response.data : item
          );
          this.updateCache(updatedList);
        }
      })
    );
  }

  /**
   * Menghapus user admin
   */
  deleteUser(id: number): Observable<{ success: boolean; message?: string }> {
    return this.http.delete<{ success: boolean; message?: string }>(`${this.adminApiUrl}/${id}`).pipe(
      tap((response) => {
        if (response?.success) {
          const updatedList = this.cachedUsers.filter((item) => item.id !== id);
          this.updateCache(updatedList);
        }
      })
    );
  }
}
