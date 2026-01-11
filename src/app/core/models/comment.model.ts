import { User } from './user.model';

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  author: User;
}

export interface CommentPage {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}