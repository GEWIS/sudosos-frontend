import { User } from '@/entities/User';

export interface MemberAuthentication {
  id: number;
  user: User;
  authenticateAs: User;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
