import Dinero from 'dinero.js';
import { BaseProduct, Product } from '@/entities/Product';
import { ProductCategory } from '@/entities/ProductCategory';
import { ProductOrder } from '@/entities/ProductOrder';
import UserTransformer from '@/transformers/UserTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeProduct(data: any) : BaseProduct | Product {
    if (!Object.keys(data).includes('owner')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        name: data.name,
        price: Dinero({ amount: Number(data.price), currency: 'EUR' }),
      } as BaseProduct;
    }

    const category = {
      id: data.productCategory.id,
      name: data.productCategory.name,
    } as ProductCategory;

    return {
      ...BaseTransformer.makeBaseEntity(data),
      revision: data.revision,
      name: data.name,
      price: Dinero({ amount: Number(data.price), currency: 'EUR' }),
      owner: UserTransformer.makeUser(data.owner),
      category,
      picture: data.picture,
      alcoholPercentage: data.alcoholPercentage,
    } as Product;
  },

  makeProductOrder(data: any): ProductOrder {
    return {
      productID: data.productID,
      order: data.order,
    } as ProductOrder;
  },
};
