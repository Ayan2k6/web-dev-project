import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

import { ApiService } from './api.service';
import { AuthTokens, UserProfile, UserRole } from '../interfaces/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(
    private readonly http: HttpClient,
    private readonly api: ApiService,
  ) {}

  login(username: string, password: string): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>(this.api.buildUrl('/api/token/'), { username, password })
      .pipe(tap((tokens) => this.persistTokens(tokens)));
  }

  register(payload: {
    username: string;
    password: string;
    email?: string;
    role?: UserRole;
    faculty?: string;
    bio?: string;
  }) {
    return this.http.post<UserProfile>(this.api.buildUrl('/api/users/register/'), payload);
  }

  refreshToken() {
    const refresh = localStorage.getItem(this.refreshTokenKey);
    if (!refresh) {
      return of(null);
    }

    return this.http
      .post<{ access: string }>(this.api.buildUrl('/api/token/refresh/'), { refresh })
      .pipe(
        tap((res) => {
          if (res?.access) {
            localStorage.setItem(this.accessTokenKey, res.access);
          }
        }),
        catchError(() => {
          this.clearTokens();
          return of(null);
        }),
      );
  }

  logout() {
    const refresh = localStorage.getItem(this.refreshTokenKey);
    if (!refresh) {
      this.clearTokens();
      return of(null);
    }

    return this.http.post(this.api.buildUrl('/api/users/logout/'), { refresh }).pipe(
      catchError(() => of(null)),
      tap(() => this.clearTokens()),
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getCurrentUserId(): number | null {
    const access = this.getAccessToken();
    if (!access) {
      return null;
    }

    const parts = access.split('.');
    if (parts.length !== 3) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      if (typeof payload.user_id === 'number') {
        return payload.user_id;
      }
      if (typeof payload.user_id === 'string') {
        const parsed = Number(payload.user_id);
        return Number.isNaN(parsed) ? null : parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  private persistTokens(tokens: AuthTokens) {
    localStorage.setItem(this.accessTokenKey, tokens.access);
    localStorage.setItem(this.refreshTokenKey, tokens.refresh);
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }
}
