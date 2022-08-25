import { BaseEntity } from '@/entities/BaseEntity';
import { User } from '@/entities/User';
import { Dinero } from 'dinero.js';

export enum PayoutRequestState {
  CREATED = 'CREATED',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}

export interface PayoutRequest extends BaseEntity {
  requestedBy: User,
  approvedBy?: User,
  amount: Dinero,
  status: PayoutRequestState,
  bankAccountNumber: string,
  bankAccountName: string,
}

export interface PayoutRequestFilter {
  requestedById: number,
  approvedById: number,
  fromDate: string,
  tillDate: string,
  status: PayoutRequestState,
}
