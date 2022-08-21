import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';
import { Pagination } from '@/entities/Pagination';
// eslint-disable-next-line import/no-cycle
import { Invoice } from '@/entities/Invoice';
import { StripeDeposit } from '@/entities/StripeDeposit';
import { PayoutRequest } from '@/entities/PayoutRequest';

export enum TransferType {
  DEPOSIT = 1,
  INVOICE = 2,
  CUSTOM = 3,
}

export interface Transfer extends BaseEntity {
  from?: BaseUser | User;
  to?: BaseUser | User;
  amount: Dinero;
  description?: string;
  _showDetails?: boolean;
  nextCategory?: string;
  invoice?: Invoice;
  deposit?: StripeDeposit;
  payoutRequest?: PayoutRequest;
}

export interface TransferList {
  _pagination: Pagination,
  records: Transfer[],
}

export interface TransferFilter {
  fromId: number,
  toId: number,
  id: number,
}
