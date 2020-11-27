import { User } from '@/entities/User';

export interface EANAuthentication {
  id: number;
  userID: User['id'];
  eanCode: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
