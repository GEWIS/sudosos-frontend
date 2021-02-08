import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface BorrelkaartGroup extends BaseEntity {
  name: string;
  validDates?: {
    activeStartDate: Date,
    activeEndDate: Date,
  };
  borrelkaarten: User[];
}
