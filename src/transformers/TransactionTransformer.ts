/* eslint-disable max-len */
import { Transaction } from '@/entities/Transaction';
import UserTransformer from '@/transformers/UserTransformer';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';
import SubTransactionTransformer from '@/transformers/SubTransactionTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeTransaction(data: any) : Transaction {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      from: UserTransformer.makeUser(data.from),
      createdBy: UserTransformer.makeUser(data.createdBy),
      pointOfSale: PointOfSaleTransformer.makePointOfSale(data.pointOfSale),
      subTransactions: data.subTransactions.map((subTrans: any) => SubTransactionTransformer.makeSubTransaction(subTrans)),
    } as Transaction;
  },
};
