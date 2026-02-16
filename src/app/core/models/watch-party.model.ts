import { User } from './user.model';

export interface WatchParty {
  id: number;
  roomCode: string;
  creator: User;
  createdAt: string;
  active: boolean;
}
