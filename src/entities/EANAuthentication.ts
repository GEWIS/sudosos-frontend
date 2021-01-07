import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface EANAuthentication extends BaseEntity {
  id: number;
  userID: User['id'];
  eanCode: string;
}
