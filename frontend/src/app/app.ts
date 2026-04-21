import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { UserProfile } from './interfaces/api.models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  me: UserProfile | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    if (this.isLoggedIn) {
      this.loadMe();
    }

    this.router.events.subscribe(() => {
      if (this.isLoggedIn && !this.me) {
        this.loadMe();
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadMe() {
    this.usersService.getMe().subscribe({
      next: (user) => {
        this.me = user;
      },
      error: () => {
        this.me = null;
      },
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.me = null;
      this.router.navigateByUrl('/auth');
    });
  }
}
