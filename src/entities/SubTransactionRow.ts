import { Product } from '@/entities/Product';
import { BaseEntity } from '@/entities/BaseEntity';

export interface SubTransactionRow extends BaseEntity {
  product: Product;
  amount: number;
}
