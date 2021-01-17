import { SubTransactionRow } from '@/entities/SubTransactionRow';
import ProductTransformer from '@/transformers/ProductTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeSubTransactionRow(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      product: ProductTransformer.makeProduct(data.product),
      amount: data.amount,
    } as SubTransactionRow;
  },
};
