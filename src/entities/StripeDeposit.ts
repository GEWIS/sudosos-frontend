import { BaseEntity } from '@/entities/BaseEntity';
import { BaseUser, User } from '@/entities/User';
import { Dinero } from 'dinero.js';

export enum StripeDepositState {
  CREATED = 1,
  PROCESSING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface StripeDepositStatus extends BaseEntity {
  state: StripeDepositState;
}

export interface StripeDeposit extends BaseEntity {
  to: BaseUser | User;
  depositStatus: StripeDepositStatus[];
  stripeId: string;
  amount: Dinero;
}
