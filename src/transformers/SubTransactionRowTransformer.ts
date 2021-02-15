import Dinero from 'dinero.js';
import { SubTransactionRow } from '@/entities/SubTransactionRow';
import ProductTransformer from '@/transformers/ProductTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeSubTransactionRow(data: any) {
    const product = ProductTransformer.makeProduct(data.product);
    const price = product.price.getAmount() * data.amount;

    return {
      ...BaseTransformer.makeBaseEntity(data),
      product,
      amount: data.amount,
      price: Dinero({ amount: price, currency: 'EUR' }),
    } as SubTransactionRow;
  },
};
