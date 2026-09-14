import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import CryptoJS from 'crypto-js';

import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HmacInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const timestamp = Date.now().toString();
    const body = (request.body instanceof FormData || request.body instanceof Blob)
      ? ''
      : (request.body ? JSON.stringify(request.body) : '');
    const payload = `${request.method}\n${request.urlWithParams}\n${timestamp}\n${body}`;
    const signature = CryptoJS.HmacSHA256(payload, environment.hmacSecret).toString(CryptoJS.enc.Hex);
    const token = this.authService.getToken();

    const signedRequest = request.clone({
      setHeaders: {
        'X-Timestamp': timestamp,
        'X-Signature': signature,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return next.handle(signedRequest).pipe(
      catchError((error) => {
        const isLoginRequest = request.url.endsWith('/auth/login');

        if (error.status === 401 && token && !isLoginRequest) {
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}
