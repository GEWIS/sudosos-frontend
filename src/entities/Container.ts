import { User } from '@/entities/User';
import { Product } from '@/entities/Product';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Container extends BaseEntity {
  revision: number;
  name: string;
  owner: User;
  products: Product[];
}
