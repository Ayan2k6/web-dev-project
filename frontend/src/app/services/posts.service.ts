import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';
import { Comment, Post, ToggleLikeResponse } from '../interfaces/api.models';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(
    private readonly http: HttpClient,
    private readonly api: ApiService,
  ) {}

  getPosts() {
    return this.http.get<Post[]>(this.api.buildUrl('/api/posts/'));
  }

  createPost(payload: { title: string; content: string; is_official: boolean }) {
    return this.http.post<Post>(this.api.buildUrl('/api/posts/'), payload);
  }

  updatePost(postId: number, payload: { title: string; content: string; is_official: boolean }) {
    return this.http.patch<Post>(this.api.buildUrl(`/api/posts/${postId}/`), payload);
  }

  deletePost(postId: number) {
    return this.http.delete(this.api.buildUrl(`/api/posts/${postId}/`));
  }

  toggleLike(postId: number) {
    return this.http.post<ToggleLikeResponse>(this.api.buildUrl(`/api/posts/${postId}/like/`), {});
  }

  getComments(postId: number) {
    return this.http.get<Comment[]>(this.api.buildUrl(`/api/posts/${postId}/comments/`));
  }

  addComment(postId: number, text: string) {
    return this.http.post<Comment>(this.api.buildUrl(`/api/posts/${postId}/comments/`), { text });
  }
}
