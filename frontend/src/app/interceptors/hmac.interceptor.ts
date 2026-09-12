import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import CryptoJS from 'crypto-js';

import { environment } from '../../environments/environment';

@Injectable()
export class HmacInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const timestamp = Date.now().toString();
    const body = request.body ? JSON.stringify(request.body) : '';
    const payload = `${request.method}\n${request.urlWithParams}\n${timestamp}\n${body}`;
    const signature = CryptoJS.HmacSHA256(payload, environment.hmacSecret).toString(CryptoJS.enc.Hex);

    const signedRequest = request.clone({
      setHeaders: {
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
    });

    return next.handle(signedRequest);
  }
}
