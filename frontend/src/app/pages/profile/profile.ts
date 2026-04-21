import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, CommonModule } from '@angular/common';

import { UserProfile } from '../../interfaces/api.models';
import { UsersService } from '../../services/users.service';
import { ChatsService } from '../../services/chats.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  me: UserProfile | null = null;
  recommendations: UserProfile[] = [];
  allUsers: UserProfile[] = [];
  message = '';
  error = '';

  constructor(
    private readonly usersService: UsersService,
    private readonly chatsService: ChatsService,
  ) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loadMe();
    this.loadRecommendations();
    this.loadUsers();
  }

  loadMe() {
    this.usersService.getMe().subscribe({
      next: (profile) => {
        this.me = profile;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Failed to load your profile.');
      },
    });
  }

  loadRecommendations() {
    this.usersService.getRecommendations().subscribe({
      next: (users) => {
        this.recommendations = users;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Failed to load recommendations.');
      },
    });
  }

  loadUsers() {
    this.usersService.getProfiles().subscribe({
      next: (users) => {
        this.allUsers = users;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Failed to load users list.');
      },
    });
  }

  toggleFriend(user: UserProfile) {
    this.usersService.toggleFriend(user.id).subscribe({
      next: (res) => {
        this.message = res.message;
        this.refresh();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Friend action failed.');
      },
    });
  }

  toggleSubscription(org: UserProfile) {
    this.usersService.toggleSubscription(org.id).subscribe({
      next: (res) => {
        this.message = res.message;
        this.refresh();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Subscription action failed.');
      },
    });
  }

  startChat(user: UserProfile) {
    this.chatsService.createChat(user.id).subscribe({
      next: () => {
        this.message = `Chat with ${user.username} is ready. Open Messages page.`;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not create chat.');
      },
    });
  }

  isFriend(userId: number): boolean {
    return !!this.me?.friends?.includes(userId);
  }

  isSubscribed(orgId: number): boolean {
    return !!this.me?.subscriptions?.includes(orgId);
  }

  isSelf(userId: number): boolean {
    return this.me?.id === userId;
  }

  private extractError(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;
    if (body?.detail) return body.detail;
    if (body?.error) return body.error;
    if (typeof body === 'string') return body;
    return fallback;
  }
}