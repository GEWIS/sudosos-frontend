import { User } from '@/entities/User';

export interface Transfer {
  id: number;
  from: User;
  to: User;
  amount: number;
  type: TransferType
  description: null | string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export enum TransferType {
  DEPOSIT = 'DEPOSIT',
  INVOICE = 'INVOICE',
  CUSTOM = 'CUSTOM',
}
