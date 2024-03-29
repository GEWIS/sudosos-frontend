import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';
import { BasePointOfSale, PointOfSale } from '@/entities/PointOfSale';
import { SubTransaction } from '@/entities/SubTransaction';
import { Pagination } from '@/entities/Pagination';

export interface Transaction extends BaseEntity {
  from: BaseUser | User;
  createdBy?: BaseUser | User;
  pointOfSale: BasePointOfSale | PointOfSale;
  subTransactions: SubTransaction[];
  price: Dinero;
  _showDetails?: boolean;
  nextCategory?: string;
}

export interface TransactionList {
  _pagination: Pagination,
  records: Transaction[],
}

export interface POSTransaction {
  id: number;
  transactions: Transaction[];
}

export interface TransactionFilter {
  fromId: number,
  createdById: number,
  toId: number,
  pointOfSaleId: number,
  productId: number,
  productRevision: number,
  fromDate: string,
  tillDate: string,
}
