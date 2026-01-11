import { User } from './user.model';

export interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  uploadedAt: string;
  owner: User;
  location?: string;
  tags?: string[];
}

export interface VideoPage {
  content: Video[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}