import { FlaggedTransaction } from '@/entities/FlaggedTransaction';
import BaseTransformer from '@/transformers/BaseTransformer';
import UserTransformer from '@/transformers/UserTransformer';
import TransactionTransformer from '@/transformers/TransactionTransformer';

export default {
  makeFlaggedTransaction(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      status: data.status,
      flaggedBy: UserTransformer.makeUser(data.flaggedBy),
      reason: data.reason,
      transaction: TransactionTransformer.makeTransaction(data.transaction),
    } as FlaggedTransaction;
  },
};
