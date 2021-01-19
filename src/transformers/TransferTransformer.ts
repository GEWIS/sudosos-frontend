import Dinero from 'dinero.js';
import { Transfer } from '@/entities/Transfer';
import BaseTransformer from '@/transformers/BaseTransformer';
import UserTransformer from '@/transformers/UserTransformer';

export default {
  makeTransfer(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      from: UserTransformer.makeUser(data.from),
      to: UserTransformer.makeUser(data.to),
      amount: Dinero({ amount: data.amount, currency: 'EUR' }),
      type: data.type,
      description: data.description,
    } as Transfer;
  },
};
