import { Product } from '@/entities/Product';
import { SubTransaction } from '@/entities/SubTransaction';

export interface SubTransactionRow {
  id: number;
  product: Product;
  amount: number;
  price: number;
  subTransaction: SubTransaction;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
