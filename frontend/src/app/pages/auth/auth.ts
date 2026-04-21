import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, timeout, TimeoutError } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../interfaces/api.models';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, NgIf],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  mode: 'login' | 'register' = 'login';
  loading = false;
  error = '';
  status = '';

  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly destroyRef = inject(DestroyRef);

  loginForm = {
    username: '',
    password: '',
  };

  registerForm: {
    username: string;
    password: string;
    email: string;
    role: UserRole;
    faculty: string;
    bio: string;
  } = {
    username: '',
    password: '',
    email: '',
    role: 'student',
    faculty: '',
    bio: '',
  };

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  switchMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.error = '';
    this.status = '';
  }

  submitLogin() {
    if (!this.loginForm.username || !this.loginForm.password) {
      return;
    }

    this.setLoading(true);

    this.authService
      .login(this.loginForm.username.trim(), this.loginForm.password)
      .pipe(
        timeout(10000),
        finalize(() => this.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/home');
        },
        error: (err: unknown) => {
          this.error = this.extractError(err, 'Failed to login. Check username and password.');
        },
      });
  }

  submitRegister() {
    if (!this.registerForm.username || !this.registerForm.password) {
      this.error = 'Username и Password обязательны.';
      return;
    }

    if (this.registerForm.password.length < 8) {
      this.error = 'Пароль должен содержать минимум 8 символов.';
      return;
    }

    this.setLoading(true);

    this.authService
      .register({
        username: this.registerForm.username.trim(),
        password: this.registerForm.password,
        email: this.registerForm.email.trim(),
        role: this.registerForm.role,
        faculty: this.registerForm.faculty.trim(),
        bio: this.registerForm.bio.trim(),
      })
      .pipe(
        timeout(10000),
        finalize(() => this.setLoading(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.loginForm.username = this.registerForm.username.trim();
          this.loginForm.password = this.registerForm.password;
          this.mode = 'login';
          this.status = 'Аккаунт создан. Теперь войдите под этим username and password.';
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          this.error = this.extractError(err, 'Registration failed. Please verify the form fields.');
          if (this.error.toLowerCase().includes('username')) {
            this.mode = 'login';
          }
        },
      });
  }

  private setLoading(value: boolean) {
    this.loading = value;

    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }

    if (value) {
      this.loadingTimer = setTimeout(() => {
        if (this.loading) {
          this.loading = false;
          this.error = 'Запрос занял слишком много времени. Проверь соединение и попробуй снова.';
        }
      }, 15000);
    }
  }

  private extractError(error: unknown, fallback: string): string {
    if (error instanceof TimeoutError || (error as { name?: string })?.name === 'TimeoutError') {
      return 'Сервер долго отвечает. Попробуй еще раз через 2-3 секунды.';
    }

    const httpError = error as HttpErrorResponse;
    const body = httpError?.error;
    if (typeof body === 'string') {
      return body;
    }
    if (body?.detail) {
      const detail = String(body.detail);
      if (detail.includes('No active account found')) {
        return 'Неверный логин или пароль.';
      }
      return detail;
    }
    if (body?.error) {
      return body.error;
    }
    if (body && typeof body === 'object') {
      if (Array.isArray(body.username) && body.username.length) {
        return `Username: ${String(body.username[0])}`;
      }
      if (Array.isArray(body.password) && body.password.length) {
        return `Password: ${String(body.password[0])}`;
      }
      const firstValue = Object.values(body)[0];
      if (Array.isArray(firstValue) && firstValue.length) {
        return String(firstValue[0]);
      }
      if (firstValue) {
        return String(firstValue);
      }
    }
    return fallback;
  }
}