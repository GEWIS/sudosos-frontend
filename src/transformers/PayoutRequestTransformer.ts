import BaseTransformer from '@/transformers/BaseTransformer';
import UserTransformer from '@/transformers/UserTransformer';
import Dinero from 'dinero.js';
import { PayoutRequest } from '@/entities/PayoutRequest';

export default {
  makePayoutRequest(data: any) {
    let amount;

    if (typeof data.amount === 'object') {
      if (data.amount.amount !== undefined) {
        amount = Dinero({ amount: Number(data.amount.amount), currency: 'EUR' });
      } else {
        // This is to satisfy ESLint, yay
        const dineroPrice = data.amount;
        amount = dineroPrice;
      }
    } else {
      amount = Dinero({ amount: Number(data.amount), currency: 'EUR' });
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      requestedBy: UserTransformer.makeUser(data.requestedBy),
      approvedBy: UserTransformer.makeUser(data.approvedBy),
      amount,
      status: data.status,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountName: data.bankAccountName,
    } as PayoutRequest;
  },
};
