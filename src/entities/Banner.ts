import { BaseEntity } from '@/entities/BaseEntity';

export interface Banner extends BaseEntity {
  name: string;
  picture: string;
  duration: number;
  active: boolean;
  startDate?: Date;
  endDate: Date;
}
