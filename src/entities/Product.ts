import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';
import { BaseEntity } from '@/entities/BaseEntity';

export interface BaseProduct extends BaseEntity {
  name: string;
  price: Dinero;
}

export interface Product extends BaseProduct {
  revision?: number;
  owner: BaseUser | User;
  category: ProductCategory;
  picture: string;
  alcoholPercentage: number;
}
