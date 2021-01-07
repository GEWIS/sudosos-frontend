import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface MemberAuthentication extends BaseEntity {
  id: number;
  user: User;
  authenticateAs: User;
}
