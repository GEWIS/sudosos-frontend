import { SubTransactionRow } from '@/entities/SubTransactionRow';
import ProductTransformer from '@/transformers/ProductTransformer';

export default {
  makeSubTransactionRow(data: any) {
    return {
      product: ProductTransformer.makeProduct(data.product),
      amount: data.amount,
    } as SubTransactionRow;
  },
};
