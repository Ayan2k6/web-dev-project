import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

// Эти endpoints не требуют авторизации — не добавляем токен и не делаем refresh при 401
const PUBLIC_ENDPOINTS = ['/api/token/', '/api/users/register/'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isPublic = PUBLIC_ENDPOINTS.some((url) => req.url.includes(url));

  // Для публичных роутов — не добавляем токен вообще
  const request = (!isPublic && authService.getAccessToken())
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authService.getAccessToken()}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Публичные endpoints и не-401 ошибки — сразу пробрасываем
      if (error.status !== 401 || isPublic) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap((res) => {
          if (!res?.access) {
            authService.clearTokens();
            router.navigateByUrl('/auth');
            return throwError(() => error);
          }

          const retried = req.clone({
            setHeaders: { Authorization: `Bearer ${res.access}` },
          });
          return next(retried);
        }),
        catchError((refreshError) => {
          authService.clearTokens();
          router.navigateByUrl('/auth');
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
