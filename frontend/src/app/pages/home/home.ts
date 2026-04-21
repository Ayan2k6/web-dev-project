import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Post, UserProfile } from '../../interfaces/api.models';
import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/posts.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  posts: Post[] = [];
  me: UserProfile | null = null;
  loading = true;
  actionMessage = '';
  actionError = '';
  currentUserId: number | null = null;

  postForm = {
    title: '',
    content: '',
    is_official: false,
  };

  editingPostId: number | null = null;

  commentText: Record<number, string> = {};
  commentsVisible: Record<number, boolean> = {};
  commentsByPost: Record<number, Array<{ author: string; text: string; created_at: string }>> = {};

  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit() {
    this.fetchMe();
    this.loadFeed();
  }

  fetchMe() {
    this.usersService.getMe().subscribe({
      next: (user) => {
        this.me = user;
      },
    });
  }

  loadFeed() {
    this.loading = true;
    this.postsService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.actionError = this.extractError(err, 'Could not load feed.');
      },
    });
  }

  submitPost() {
    if (!this.postForm.title.trim() || !this.postForm.content.trim()) {
      return;
    }

    this.actionError = '';
    this.actionMessage = '';

    const payload = {
      title: this.postForm.title.trim(),
      content: this.postForm.content.trim(),
      is_official: this.postForm.is_official,
    };

    if (this.editingPostId) {
      this.postsService.updatePost(this.editingPostId, payload).subscribe({
        next: () => {
          this.actionMessage = 'Post updated.';
          this.resetPostForm();
          this.loadFeed();
        },
        error: (err: HttpErrorResponse) => {
          this.actionError = this.extractError(err, 'Could not update post.');
        },
      });
      return;
    }

    this.postsService.createPost(payload).subscribe({
      next: () => {
        this.actionMessage = 'Post published.';
        this.resetPostForm();
        this.loadFeed();
      },
      error: (err: HttpErrorResponse) => {
        this.actionError = this.extractError(err, 'Could not publish post.');
      },
    });
  }

  startEdit(post: Post) {
    this.editingPostId = post.id;
    this.postForm = {
      title: post.title,
      content: post.content,
      is_official: post.is_official,
    };
  }

  cancelEdit() {
    this.resetPostForm();
  }

  deletePost(post: Post) {
    if (!confirm('Delete this post?')) {
      return;
    }

    this.postsService.deletePost(post.id).subscribe({
      next: () => {
        this.actionMessage = 'Post deleted.';
        this.loadFeed();
      },
      error: (err: HttpErrorResponse) => {
        this.actionError = this.extractError(err, 'Could not delete post.');
      },
    });
  }

  toggleLike(post: Post) {
    this.postsService.toggleLike(post.id).subscribe({
      next: (res) => {
        post.likes_count += res.liked ? 1 : -1;
      },
      error: (err: HttpErrorResponse) => {
        this.actionError = this.extractError(err, 'Like action failed.');
      },
    });
  }

  toggleComments(postId: number) {
    this.commentsVisible[postId] = !this.commentsVisible[postId];
    if (this.commentsVisible[postId] && !this.commentsByPost[postId]) {
      this.loadComments(postId);
    }
  }

  loadComments(postId: number) {
    this.postsService.getComments(postId).subscribe({
      next: (comments) => {
        this.commentsByPost[postId] = comments.map((item) => ({
          author: item.author.username,
          text: item.text,
          created_at: item.created_at,
        }));
      },
      error: (err: HttpErrorResponse) => {
        this.actionError = this.extractError(err, 'Could not load comments.');
      },
    });
  }

  addComment(postId: number) {
    const text = (this.commentText[postId] || '').trim();
    if (!text) {
      return;
    }

    this.postsService.addComment(postId, text).subscribe({
      next: () => {
        this.commentText[postId] = '';
        this.loadComments(postId);
        const post = this.posts.find((item) => item.id === postId);
        if (post) {
          post.comments_count += 1;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.actionError = this.extractError(err, 'Could not add comment.');
      },
    });
  }

  canManage(post: Post): boolean {
    return this.currentUserId === post.author.id;
  }

  private resetPostForm() {
    this.editingPostId = null;
    this.postForm = { title: '', content: '', is_official: false };
  }

  private extractError(error: HttpErrorResponse, fallback: string): string {
    const body = error.error;
    if (body?.detail) {
      return body.detail;
    }
    if (body?.error) {
      return body.error;
    }
    if (typeof body === 'string') {
      return body;
    }
    if (body && typeof body === 'object') {
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
