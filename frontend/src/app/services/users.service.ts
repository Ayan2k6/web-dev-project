import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';
import {
  ToggleFriendResponse,
  ToggleSubscriptionResponse,
  UserProfile,
} from '../interfaces/api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(
    private readonly http: HttpClient,
    private readonly api: ApiService,
  ) {}

  getProfiles() {
    return this.http.get<UserProfile[]>(this.api.buildUrl('/api/users/profiles/'));
  }

  getProfileById(userId: number) {
    return this.http.get<UserProfile>(this.api.buildUrl(`/api/users/profiles/${userId}/`));
  }

  getMe() {
    return this.http.get<UserProfile>(this.api.buildUrl('/api/users/me/'));
  }

  getRecommendations() {
    return this.http.get<UserProfile[]>(this.api.buildUrl('/api/users/recommendations/'));
  }

  toggleFriend(userId: number) {
    return this.http.post<ToggleFriendResponse>(
      this.api.buildUrl(`/api/users/friends/toggle/${userId}/`),
      {},
    );
  }

  toggleSubscription(orgId: number) {
    return this.http.post<ToggleSubscriptionResponse>(
      this.api.buildUrl(`/api/users/subs/toggle/${orgId}/`),
      {},
    );
  }
}
