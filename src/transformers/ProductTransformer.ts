import Dinero from 'dinero.js';
import { Product } from '@/entities/Product';
import { BaseUser } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';

export default {
  makeProduct(data: any) {
    const owner = {
      id: data.owner.id,
      name: data.owner.name,
    } as BaseUser;

    const price = Dinero({ amount: Number(data.price), currency: 'EUR' });

    const category = {
      id: data.productCategory.id,
      name: data.productCategory.name,
    } as ProductCategory;

    return {
      id: data.id,
      revision: data.revision,
      name: data.name,
      price,
      owner,
      category,
      picture: data.picture,
      alcoholPercentage: data.alcoholPercentage,
    } as Product;
  },
};
