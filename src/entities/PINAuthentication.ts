import { User } from '@/entities/User';

export interface PINAuthentication {
  id: number;
  user: User;
  pin: number;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
