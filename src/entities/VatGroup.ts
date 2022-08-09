import { BaseEntity } from '@/entities/BaseEntity';
import { Pagination } from '@/entities/Pagination';

export interface VatGroup extends BaseEntity {
  name: string,
  deleted: boolean,
  hidden: boolean,
  percentage: number,
}

export interface VatGroupList {
  _pagination: Pagination;
  records: VatGroup[];
}
