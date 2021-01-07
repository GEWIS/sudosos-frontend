import { User } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Product extends BaseEntity {
  id: number;
  version: number;
  name: string;
  price: number;
  owner: User;
  category: ProductCategory;
  picture: string;
  alcoholPercentage: number;
}
