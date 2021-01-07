import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface BorrelkaartGroep extends BaseEntity {
  id: number;
  name: string;
  activeStartDate: Date;
  activeEndDate: Date;
  borrelkaarten: User[];
}
