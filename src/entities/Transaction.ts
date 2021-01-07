import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Transaction extends BaseEntity {
  id: number;
  from: User;
  createdBy: User;
}
