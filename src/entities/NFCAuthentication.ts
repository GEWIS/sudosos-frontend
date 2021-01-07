import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface NFCAuthentication extends BaseEntity {
  id: number;
  user: User;
  uid: string;
  name: string;
}
