/* eslint-disable max-len */

import Dinero from 'dinero.js';
import { SubTransaction } from '@/entities/SubTransaction';
import UserTransformer from '@/transformers/UserTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import SubTransactionRowTransformer from '@/transformers/SubTransactionRowTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';
import { SubTransactionRow } from '@/entities/SubTransactionRow';

export default {
  makeSubTransaction(data: any) : SubTransaction {
    const subTransactionRows = data.subTransactionRows.map((subTransRow: any) => SubTransactionRowTransformer.makeSubTransactionRow(subTransRow));
    let price = 0;

    subTransactionRows.forEach((subTransRow: SubTransactionRow) => { price += subTransRow.price.getAmount(); });

    return {
      ...BaseTransformer.makeBaseEntity(data),
      to: UserTransformer.makeUser(data.to),
      container: ContainerTransformer.makeContainer(data.container),
      subTransactionRows,
      price: Dinero({ amount: price, currency: 'EUR' }),
    } as SubTransaction;
  },
};
