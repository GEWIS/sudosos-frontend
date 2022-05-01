import { BaseEntity } from '@/entities/BaseEntity';
import { Pagination } from '@/entities/Pagination';

export interface ProductCategory extends BaseEntity {
  name: string;
  text?: string;
}

export interface ProductCategoryList {
  _pagination: Pagination;
  records: ProductCategory[];
}
