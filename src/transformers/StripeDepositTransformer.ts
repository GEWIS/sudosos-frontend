import { StripeDeposit, StripeDepositStatus } from '@/entities/StripeDeposit';
import BaseTransformer from '@/transformers/BaseTransformer';
import UserTransformer from '@/transformers/UserTransformer';
import Dinero from 'dinero.js';

export default {
  makeStripeDeposit(data: any): StripeDeposit {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      to: UserTransformer.makeUser(data.to),
      stripeId: data.stripeId,
      depositStatus: data.depositStatus.map((status: any) => this.makeStripeDepositStatus(status)),
      amount: Dinero(data.amount),
    };
  },

  makeStripeDepositStatus(data: any): StripeDepositStatus {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      state: data.state,
    };
  },
};
