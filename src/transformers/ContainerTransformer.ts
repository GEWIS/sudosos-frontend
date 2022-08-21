import { globalFormatRoundingMode } from 'dinero.js';
import { BaseContainer, Container } from '@/entities/Container';
import UserTransformer from '@/transformers/UserTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeContainer(data: any) : BaseContainer | Container {
    if (!Object.keys(data).includes('owner')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        name: data.name,
      } as BaseContainer;
    }

    let products = [];

    if (data.products !== undefined) {
      products = data.products.map((product: any) => ProductTransformer.makeProduct(product));
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      revision: data.revision,
      owner: UserTransformer.makeUser(data.owner),
      products,
      public: data.public,
    } as Container;
  },
};
