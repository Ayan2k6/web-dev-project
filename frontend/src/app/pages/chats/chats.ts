import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Chat, Message, UserProfile } from '../../interfaces/api.models';
import { ChatsService } from '../../services/chats.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-chats',
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './chats.html',
  styleUrl: './chats.css',
})
export class Chats implements OnInit {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;
  messages: Message[] = [];
  users: UserProfile[] = [];
  selectedUserId: number | null = null;
  draft = '';
  error = '';
  message = '';

  constructor(
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
  ) {}

  ngOnInit() {
    this.loadChats();
    this.loadUsers();
  }

  loadUsers() {
    this.usersService.getProfiles().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not load users list.');
      },
    });
  }

  loadChats() {
    this.chatsService.getMyChats().subscribe({
      next: (chats) => {
        this.chats = chats;
        if (!this.selectedChat && chats.length) {
          this.openChat(chats[0]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not load chats.');
      },
    });
  }

  openChat(chat: Chat) {
    this.selectedChat = chat;
    this.chatsService.getMessages(chat.id).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not load messages.');
      },
    });
  }

  sendMessage() {
    if (!this.selectedChat || !this.draft.trim()) {
      return;
    }

    this.chatsService.sendMessage(this.selectedChat.id, this.draft.trim()).subscribe({
      next: (message) => {
        this.messages = [...this.messages, message];
        this.draft = '';
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not send message.');
      },
    });
  }

  createChat() {
    if (!this.selectedUserId) {
      return;
    }

    this.chatsService.createChat(this.selectedUserId).subscribe({
      next: (chat) => {
        this.message = 'Chat created.';
        this.error = '';
        this.selectedUserId = null;
        this.loadChats();
        this.openChat(chat);
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.extractError(err, 'Could not create chat.');
      },
    });
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
    return fallback;
  }
}
