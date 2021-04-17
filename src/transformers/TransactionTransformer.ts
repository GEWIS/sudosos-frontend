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
    const subTransactions = data.subTransactions.map((subTrans: any) => SubTransactionTransformer.makeSubTransaction(subTrans));
    let price;

    if (typeof data.price === 'object') {
      // This is to satisfy ESLint, yay
      const dineroPrice = data.price;
      price = dineroPrice;
    } else {
      let tempPrice = 0;
      subTransactions.forEach((subTrans: SubTransaction) => { tempPrice += subTrans.price.getAmount(); });
      price = Dinero({ amount: Number(tempPrice), currency: 'EUR' });
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
