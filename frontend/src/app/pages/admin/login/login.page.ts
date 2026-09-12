import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: [],
  standalone: false,
})
export class LoginPage implements OnInit {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.username.trim()) {
      this.errorMessage = 'Username wajib diisi';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Password wajib diisi';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username.trim(), this.password.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = res.message || 'Login gagal';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.errorMessage = 'Gagal terhubung ke server login';
        }
      }
    });
  }
}
