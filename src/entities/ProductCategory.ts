import { BaseEntity } from '@/entities/BaseEntity';
import { ProductOrder } from '@/entities/ProductOrder';

export interface ProductCategory extends BaseEntity {
  name: string;
  productOrder?: ProductOrder[];
}
