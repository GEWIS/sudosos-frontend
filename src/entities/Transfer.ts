import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Transfer extends BaseEntity {
  from?: BaseUser | User;
  to?: BaseUser | User;
  amount: Dinero;
  type: TransferType
  description?: string;
}

export enum TransferType {
  DEPOSIT = 1,
  INVOICE = 2,
  CUSTOM = 3,
}
