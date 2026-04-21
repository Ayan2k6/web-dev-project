import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiService } from './api.service';
import { Chat, Message } from '../interfaces/api.models';

@Injectable({ providedIn: 'root' })
export class ChatsService {
  constructor(
    private readonly http: HttpClient,
    private readonly api: ApiService,
  ) {}

  getMyChats() {
    return this.http.get<Chat[]>(this.api.buildUrl('/api/chats/my-chats/'));
  }

  createChat(userId: number) {
    return this.http.post<Chat>(this.api.buildUrl('/api/chats/create/'), { user_id: userId });
  }

  getMessages(chatId: number) {
    return this.http.get<Message[]>(this.api.buildUrl(`/api/chats/${chatId}/messages/`));
  }

  sendMessage(chatId: number, text: string) {
    return this.http.post<Message>(this.api.buildUrl(`/api/chats/${chatId}/messages/`), { text });
  }
}
