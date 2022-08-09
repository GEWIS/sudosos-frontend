import { BaseEntity } from '@/entities/BaseEntity';
import { BaseUser, User } from '@/entities/User';
import { Transfer } from '@/entities/Transfer';
import { Dinero } from 'dinero.js';

export enum InvoiceState {
  CREATED = 1,
  SENT = 2,
  PAID = 3,
  DELETED = 4,
}

export interface InvoiceStatus extends BaseEntity {
  changedBy: BaseUser | User,
  state: InvoiceState,
}

export interface InvoiceEntry extends BaseEntity {
  price: Dinero,
  amount: number,
  description: string,
}

export interface Invoice extends BaseEntity {
  to: User,
  transfer: Transfer,
  invoiceEntries: InvoiceEntry[],
  invoiceStatus: InvoiceStatus[],
  addressee: string,
  description: string,
}

export interface InvoiceFilter {
  toId: number,
  invoiceId: number,
  state: InvoiceState,
  returnEntries: boolean,
  fromDate: string,
  toDate: string,
}
