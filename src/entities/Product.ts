import { User } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';

export interface Product {
  id: number;
  version: number;
  name: string;
  price: number;
  owner: User;
  category: ProductCategory;
  picture: string;
  alcoholPercentage: number;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
