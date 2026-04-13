import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8000/api/auth/';

  constructor(private http: HttpClient) { }

  login(credentials: any) {
    return this.http.post<any>(`${this.authUrl}login/`, credentials).pipe(
      tap(res => localStorage.setItem('access_token', res.access))
    );
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}
