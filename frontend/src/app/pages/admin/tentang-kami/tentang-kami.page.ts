import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AboutUs } from '../../../models/about.model';
import { AboutService } from '../../../services/about.service';

@Component({
  selector: 'app-tentang-kami',
  templateUrl: './tentang-kami.page.html',
  styleUrls: ['./tentang-kami.page.scss'],
  standalone: false,
})
export class TentangKamiPage implements OnInit {
  private readonly aboutService = inject(AboutService);
  private readonly fb = inject(FormBuilder);
  private readonly toastCtrl = inject(ToastController);

  aboutForm!: FormGroup;
  loading = false;
  refreshing = false;
  submitting = false;
  errorMessage = '';

  constructor() {
    this.initForm();
  }

  ngOnInit() {
    if (this.aboutService.hasCachedData && this.aboutService.cachedAbout) {
      this.populateForm(this.aboutService.cachedAbout);
      this.loading = false;
      this.silentRefresh();
    } else {
      this.loading = true;
      this.fetchAbout();
    }
  }

  private initForm() {
    this.aboutForm = this.fb.group({
      company_name: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      vision: [''],
      mission: [''],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
    });
  }

  private populateForm(data: AboutUs) {
    this.aboutForm.patchValue({
      company_name: data.company_name || '',
      description: data.description || '',
      vision: data.vision || '',
      mission: data.mission || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || '',
    });
  }

  private fetchAbout() {
    this.errorMessage = '';
    this.aboutService.getAbout().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.populateForm(res.data);
        }
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Gagal memuat profil perusahaan.');
        this.loading = false;
      },
    });
  }

  private silentRefresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.aboutService.getAbout().subscribe({
      next: (res) => {
        if (res?.success && res.data) {
          this.populateForm(res.data);
        }
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      },
    });
  }

  loadAbout(event?: any) {
    if (event) {
      this.aboutService
        .getAbout()
        .pipe(
          finalize(() => {
            event.target.complete();
          })
        )
        .subscribe({
          next: (res) => {
            if (res?.success && res.data) {
              this.populateForm(res.data);
            }
            this.errorMessage = '';
          },
          error: (err) => {
            this.handleError(err, 'Gagal memperbarui profil perusahaan.');
          },
        });
    } else {
      this.silentRefresh();
    }
  }

  saveAbout() {
    if (this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.aboutForm.value;

    this.aboutService
      .updateAbout(formValue)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.showToast('Profil perusahaan berhasil disimpan.', 'success');
            if (res.data) {
              this.populateForm(res.data);
            }
          }
        },
        error: (err) => {
          this.handleError(err, 'Gagal menyimpan profil perusahaan.');
        },
      });
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }

  private handleError(err: any, defaultMsg: string) {
    let msg = defaultMsg;
    if (err?.status === 401) {
      msg = 'Sesi login sudah berakhir. Silakan login kembali.';
    } else if (err?.error?.message) {
      msg = err.error.message;
    }
    this.errorMessage = msg;
    this.showToast(msg, 'danger');
  }
}
