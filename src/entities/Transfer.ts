import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Transfer extends BaseEntity {
  id: number;
  from: User;
  to: User;
  amount: number;
  type: TransferType
  description: null | string;
}

export enum TransferType {
  DEPOSIT = 'DEPOSIT',
  INVOICE = 'INVOICE',
  CUSTOM = 'CUSTOM',
}
