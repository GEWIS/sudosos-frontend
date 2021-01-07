import { Product } from '@/entities/Product';
import { SubTransaction } from '@/entities/SubTransaction';
import { BaseEntity } from '@/entities/BaseEntity';

export interface SubTransactionRow extends BaseEntity {
  id: number;
  product: Product;
  amount: number;
  price: number;
  subTransaction: SubTransaction;
}
