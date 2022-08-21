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
  image: string;
  alcoholPercentage: number;
  updatePending?: boolean;
  vat: number,
}

export interface ProductList {
  _pagination: Pagination;
  records: Product[];
}

interface BaseProductRequest {
  name: string,
  priceInclVat: {
    amount: number,
    currency: string,
    precision: number,
  },
  vat: number,
  category: number,
  alcoholPercentage: number,
}

export interface UpdateProductRequest extends BaseProductRequest{
  id: number,
}

export interface CreateProductRequest extends BaseProductRequest {
  ownerId: number,
}
