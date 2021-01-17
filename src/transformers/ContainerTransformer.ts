import { BaseContainer, Container } from '@/entities/Container';
import UserTransformer from '@/transformers/UserTransformer';
import ProductTransformer from '@/transformers/ProductTransformer';

export default {
  makeContainer(data: any) : BaseContainer | Container {
    if (!Object.keys(data).includes('owner')) {
      return {
        id: data.id,
        name: data.name,
      } as BaseContainer;
    }

    return {
      id: data.id,
      name: data.name,
      revision: data.revision,
      owner: UserTransformer.makeUser(data.owner),
      products: data.products.map((product: any) => ProductTransformer.makeProduct(product)),
    } as Container;
  },
};
