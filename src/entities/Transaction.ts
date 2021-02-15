import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';
import { BasePointOfSale, PointOfSale } from '@/entities/PointOfSale';
import { SubTransaction } from '@/entities/SubTransaction';

export interface Transaction extends BaseEntity {
  from: BaseUser | User;
  createdBy?: BaseUser | User;
  pointOfSale: BasePointOfSale | PointOfSale;
  subTransactions: SubTransaction[];
  price: Dinero;
}
