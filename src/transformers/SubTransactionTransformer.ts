/* eslint-disable max-len */

import { SubTransaction } from '@/entities/SubTransaction';
import UserTransformer from '@/transformers/UserTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import SubTransactionRowTransformer from '@/transformers/SubTransactionRowTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeSubTransaction(data: any) : SubTransaction {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      to: UserTransformer.makeUser(data.to),
      container: ContainerTransformer.makeContainer(data.container),
      subTransactionRows: data.subTransactionRows.map((subTransRow: any) => SubTransactionRowTransformer.makeSubTransactionRow(subTransRow)),
    } as SubTransaction;
  },
};
