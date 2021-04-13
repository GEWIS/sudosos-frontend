import { Product } from '@/entities/Product';

export interface ProductOrder {
  productID: Product['id'];
  order: number;
}
