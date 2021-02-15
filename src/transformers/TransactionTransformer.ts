/* eslint-disable max-len */
import Dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';
import UserTransformer from '@/transformers/UserTransformer';
import PointOfSaleTransformer from '@/transformers/PointOfSaleTransformer';
import SubTransactionTransformer from '@/transformers/SubTransactionTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';
import { SubTransaction } from '@/entities/SubTransaction';

export default {
  makeTransaction(data: any) : Transaction {
    const subTransactions = data.subTransactions.map((subTrans: any) => SubTransactionTransformer.makeSubTransaction(subTrans));
    let price = 0;

    subTransactions.forEach((subTrans: SubTransaction) => { price += subTrans.price.getAmount(); });


    return {
      ...BaseTransformer.makeBaseEntity(data),
      from: UserTransformer.makeUser(data.from),
      createdBy: UserTransformer.makeUser(data.createdBy),
      pointOfSale: PointOfSaleTransformer.makePointOfSale(data.pointOfSale),
      subTransactions,
      price: Dinero({ amount: price, currency: 'EUR' }),
    } as Transaction;
  },
};
