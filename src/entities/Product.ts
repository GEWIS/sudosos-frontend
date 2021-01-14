import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';
import { BaseEntity } from '@/entities/BaseEntity';

export interface Product extends BaseEntity {
  revision?: number;
  name: string;
  price: Dinero;
  owner: BaseUser | User;
  category: ProductCategory;
  picture: string;
  alcoholPercentage: number;
}
