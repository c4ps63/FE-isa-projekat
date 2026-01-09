export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  roles: Role[]; 
  bio?: string;
  avatarUrl?: string;
  createdAt?: string; 
}