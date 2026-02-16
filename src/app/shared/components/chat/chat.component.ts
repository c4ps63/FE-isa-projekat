import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { ChatMessage } from '../../../core/models/chat-message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() videoId!: number;
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  connected = false;
  private shouldScroll = false;
  private messagesSub!: Subscription;
  private connectedSub!: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.messagesSub = this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
      this.shouldScroll = true;
    });
    this.connectedSub = this.chatService.connected$.subscribe(status => {
      this.connected = status;
    });
    this.chatService.connect(String(this.videoId));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.messagesSub.unsubscribe();
    this.connectedSub.unsubscribe();
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messageContainer) {
      const el = this.messageContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
