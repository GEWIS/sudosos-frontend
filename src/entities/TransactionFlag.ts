import { Transaction } from '@/entities/Transaction';
import { User } from '@/entities/User';

export interface TransactionFlag {
  id: number;
  status: FlagStatus;
  flaggedBy: User;
  reason: string;
  transaction: Transaction;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export enum FlagStatus {
    TODO = 'TODO',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}
