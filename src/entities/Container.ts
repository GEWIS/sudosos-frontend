import { User } from '@/entities/User';
import { Product } from '@/entities/Product';

export interface Container {
  id: number;
  version: number;
  name: string;
  owner: User;
  productIDs: Product['id'][];

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
