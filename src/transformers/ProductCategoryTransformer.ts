import { ProductCategory } from '@/entities/ProductCategory';
import BaseTransformer from '@/transformers/BaseTransformer';

export default {
  makeProductCategory(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
    } as ProductCategory;
  },
};
