import { BaseEntity } from '@/entities/BaseEntity';

export interface ProductCategory extends BaseEntity {
  id: number;
  name: string;
}
