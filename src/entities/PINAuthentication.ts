import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface PINAuthentication extends BaseEntity {
  id: number;
  user: User;
  pin: number;
}
