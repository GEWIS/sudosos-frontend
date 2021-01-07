import { User } from '@/entities/User';
import { Product } from '@/entities/Product';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Container extends BaseEntity {
  id: number;
  version: number;
  name: string;
  owner: User;
  productIDs: Product['id'][];
}
