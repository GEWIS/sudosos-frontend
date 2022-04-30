/* eslint-disable max-len */
import Dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';
import UserTransformer from '@/transformers/UserTransformer';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';
import SubTransactionTransformer from '@/transformers/SubTransactionTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';
import { SubTransaction } from '@/entities/SubTransaction';
import { SubTransactionRow } from '@/entities/SubTransactionRow';

export default {
  makeTransaction(data: any) : Transaction {
    let subTransactions;
    let price = Dinero(data.value);

    if ('subTransactions' in data) {
      subTransactions = data.subTransactions.map((subTrans: any) => SubTransactionTransformer.makeSubTransaction(subTrans));
      price = Dinero(data.price);
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      from: UserTransformer.makeUser(data.from),
      createdBy: UserTransformer.makeUser(data.createdBy),
      pointOfSale: PointOfSaleTransformer.makePointOfSale(data.pointOfSale),
      subTransactions,
      price,
    } as Transaction;
  },
};
