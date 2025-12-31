export interface User {
  id: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}