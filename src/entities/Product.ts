import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { ProductCategory } from '@/entities/ProductCategory';
import { BaseEntity } from '@/entities/BaseEntity';
import { Pagination } from '@/entities/Pagination';

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
  updatePending?: boolean;
}

export interface ProductList {
  _pagination: Pagination;
  records: Product[];
}

export interface ProductRequest {
  ownerId: number,
  name: string,
  price: {
    amount: number,
    currency: string,
    precision: number,
  },
  category: number,
  alcoholPercentage: number,
}
