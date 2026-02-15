import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { ChatMessage } from '../models/chat-message.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private stompClient: Client | null = null;
  private videoId: string = '';
  private readonly MAX_MESSAGES = 200;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private connectedSubject = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSubject.asObservable();

  constructor(private authService: AuthService) {}

  connect(videoId: string): void {
    this.videoId = videoId;
    this.messagesSubject.next([]);

    const token = this.authService.getToken();
    if (!token) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connectedSubject.next(true);

        this.stompClient!.subscribe(`/topic/chat/${this.videoId}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          const current = this.messagesSubject.value;
          const updated = [...current, chatMessage];
          if (updated.length > this.MAX_MESSAGES) {
            updated.splice(0, updated.length - this.MAX_MESSAGES);
          }
          this.messagesSubject.next(updated);
        });

        this.stompClient!.publish({
          destination: `/app/chat.join/${this.videoId}`,
          body: JSON.stringify({ type: 'JOIN', content: '' })
        });
      },
      onDisconnect: () => {
        this.connectedSubject.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
        this.connectedSubject.next(false);
      }
    });

    this.stompClient.activate();
  }

  sendMessage(content: string): void {
    if (!this.stompClient || !this.connectedSubject.value) return;
    if (!content.trim()) return;

    this.stompClient.publish({
      destination: `/app/chat.sendMessage/${this.videoId}`,
      body: JSON.stringify({ type: 'CHAT', content: content.trim() })
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connectedSubject.next(false);
    this.messagesSubject.next([]);
    this.videoId = '';
  }
}
