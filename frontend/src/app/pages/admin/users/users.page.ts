import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  standalone: false,
})
export class UsersPage implements OnInit {
  protected readonly Math = Math;
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  private readonly fb = inject(FormBuilder);
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);

  users: User[] = [];
  loading = false;
  refreshing = false;
  errorMessage = '';
  currentUserId: number | null = null;

  // Filter Search & Pagination
  searchQuery = '';
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Modal State & Form
  isModalOpen = false;
  isEditing = false;
  editingId: number | null = null;
  submitting = false;
  userForm!: FormGroup;
  showPassword = false;

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    const currentUser = this.authService.getUser();
    if (currentUser && currentUser.id) {
      this.currentUserId = Number(currentUser.id);
    }

    if (this.userService.hasCachedData) {
      this.users = [...this.userService.cachedUsers];
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchUsers();
    }
  }

  private initForm() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.minLength(6)]],
    });
  }

  /** Fetch awal saat tidak ada cache */
  private fetchUsers() {
    this.errorMessage = '';
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.users = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat daftar user admin.');
        this.loading = false;
      },
    });
  }

  /** Refresh diam-diam */
  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        if (res?.success && Array.isArray(res.data)) {
          this.users = res.data;
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  /** Dipanggil oleh ion-refresher atau tombol "Perbarui" */
  loadUsers(event?: any) {
    if (event) {
      this.userService
        .getUsers()
        .pipe(
          finalize(() => {
            event.target.complete();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              this.users = res.data;
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui data user admin.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  /** Getters untuk Search & Pagination */
  get filteredUsers(): User[] {
    if (!this.searchQuery.trim()) {
      return this.users;
    }

    const query = this.searchQuery.toLowerCase().trim();
    return this.users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }

  get startIndex(): number {
    return this.filteredUsers.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length);
  }

  onSearchChange() {
    this.currentPage = 1;
  }

  onPageSizeChange() {
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Modal Actions
  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.showPassword = false;
    this.userForm.reset({ username: '', email: '', password: '' });
    // Saat Tambah User, password wajib diisi
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    this.editingId = user.id;
    this.showPassword = false;
    this.userForm.reset({
      username: user.username,
      email: user.email,
      password: '',
    });
    // Saat Edit User, password opsional
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.submitting = false;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  submitForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { username, email, password } = this.userForm.value;
    this.submitting = true;

    if (this.isEditing && this.editingId) {
      const updatePayload: { username?: string; email?: string; password?: string } = {
        username,
        email,
      };
      if (password && password.trim()) {
        updatePayload.password = password.trim();
      }

      this.userService
        .updateUser(this.editingId, updatePayload)
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res?.success) {
              this.showToast('User admin berhasil diperbarui');
              this.closeModal();
              this.loadUsers();
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui user admin.');
          },
        });
    } else {
      this.userService
        .createUser({ username, email, password })
        .pipe(finalize(() => (this.submitting = false)))
        .subscribe({
          next: (res) => {
            if (res?.success) {
              this.showToast('User admin baru berhasil ditambahkan');
              this.closeModal();
              this.loadUsers();
            }
          },
          error: (err) => {
            this.handleError(err, 'Gagal menambah user admin.');
          },
        });
    }
  }

  async confirmDelete(user: User) {
    if (this.currentUserId && user.id === this.currentUserId) {
      this.showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus user <strong>${user.username}</strong> (${user.email})?`,
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.deleteUser(user.id);
          },
        },
      ],
    });

    await alert.present();
  }

  private deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.showToast('User admin berhasil dihapus');
          this.loadUsers();
        }
      },
      error: (err) => {
        this.handleError(err, 'Gagal menghapus user admin.');
      },
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private handleError(err: any, defaultMsg: string) {
    let msg = defaultMsg;
    if (err?.error?.message) {
      msg = err.error.message;
    } else if (err?.status === 401) {
      msg = 'Sesi login sudah berakhir. Silakan login kembali.';
    }
    this.errorMessage = msg;
    this.showToast(msg, 'danger');
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    toast.present();
  }
}
