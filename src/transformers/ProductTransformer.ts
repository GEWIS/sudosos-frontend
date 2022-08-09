import Dinero from 'dinero.js';
import { BaseProduct, Product } from '@/entities/Product';
import { ProductOrder } from '@/entities/ProductOrder';
import UserTransformer from '@/transformers/UserTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';
import ProductCategoryTransformer from '@/transformers/ProductCategoryTransformer';

export default {
  makeProduct(data: any) : BaseProduct | Product {
    let price;

    if (typeof data.priceInclVat === 'object') {
      if (data.priceInclVat.amount !== undefined) {
        price = Dinero({ amount: Number(data.priceInclVat.amount), currency: 'EUR' });
      } else {
        // This is to satisfy ESLint, yay
        const dineroPrice = data.price;
        price = dineroPrice;
      }
    } else if (typeof data.price === 'object') {
      price = data.price;
    } else {
      price = Dinero({ amount: Number(data.price), currency: 'EUR' });
    }

    if (!Object.keys(data).includes('owner')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        name: data.name,
        price,
      } as BaseProduct;
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      revision: data.revision,
      name: data.name,
      price,
      vat: data.vat.percentage,
      owner: UserTransformer.makeUser(data.owner),
      category: ProductCategoryTransformer.makeProductCategory(data.category),
      picture: data.image,
      alcoholPercentage: data.alcoholPercentage,
      updatePending: data.updatePending,
    } as Product;
  },

  makeProductOrder(data: any): ProductOrder {
    return {
      productID: data.productID,
      order: data.order,
    } as ProductOrder;
  },
};
