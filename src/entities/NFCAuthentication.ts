import { User } from '@/entities/User';

export interface NFCAuthentication {
  id: number;
  user: User;
  uid: string;
  name: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
