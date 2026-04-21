import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Auth } from './pages/auth/auth';
import { Profile } from './pages/profile/profile';
import { Chats } from './pages/chats/chats';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'auth', component: Auth },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'chats', component: Chats, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' },
];
