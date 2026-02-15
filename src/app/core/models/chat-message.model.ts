export interface ChatMessage {
  type: 'CHAT' | 'JOIN' | 'LEAVE';
  content: string;
  senderUsername: string;
  senderAvatarUrl: string;
  timestamp: number;
}
