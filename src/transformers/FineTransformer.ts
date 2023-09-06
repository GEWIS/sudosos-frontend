import { Fine } from '@/entities/Fine';
import BaseTransformer from '@/transformers/BaseTransformer';
import Dinero from 'dinero.js';

export default {
  makeFine(data: any) : Fine {
    const { precision, amount, currency } = data.amount;
    return {
      ...BaseTransformer.makeBaseEntity(data),
      amount: Dinero({ precision, amount, currency }),
    };
  },
};
