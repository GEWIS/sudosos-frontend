import { Transaction } from '@/entities/Transaction';
import { BaseUser, User } from '@/entities/User';
import { BaseEntity } from '@/entities/BaseEntity';

export enum FlagStatus {
  TODO = 1,
  ACCEPTED = 2,
  REJECTED = 3,
}

export interface FlaggedTransaction extends BaseEntity {
  status: FlagStatus;
  flaggedBy: BaseUser | User;
  reason: string;
  transaction: Transaction;
}
