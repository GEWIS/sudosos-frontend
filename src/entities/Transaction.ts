import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';
import { BasePointOfSale, PointOfSale } from '@/entities/PointOfSale';
import { SubTransaction } from '@/entities/SubTransaction';

export interface Transaction extends BaseEntity {
  id: number;
  from: BaseUser | User;
  createdBy: BaseUser | User;
  pointOfSale: BasePointOfSale | PointOfSale;
  subTransactions: SubTransaction[];
}
