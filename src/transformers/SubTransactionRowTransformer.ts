import Dinero from 'dinero.js';
import { SubTransactionRow } from '@/entities/SubTransactionRow';
import ProductTransformer from '@/transformers/ProductTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeSubTransactionRow(data: any) {
    const product = ProductTransformer.makeProduct(data.product);
    let price;

    if (typeof data.price === 'object') {
      // This is to satisfy ESLint, yay
      const dineroPrice = data.price;
      price = dineroPrice;
    } else {
      price = Dinero({ amount: Number(product.price.getAmount() * data.amount), currency: 'EUR' });
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      product,
      amount: data.amount,
      price,
    } as SubTransactionRow;
  },
};
