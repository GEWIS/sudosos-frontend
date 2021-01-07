import { Transaction } from '@/entities/Transaction';
import { User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export interface TransactionFlag extends BaseEntity {
  id: number;
  status: FlagStatus;
  flaggedBy: User;
  reason: string;
  transaction: Transaction;
}

export enum FlagStatus {
    TODO = 'TODO',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}
