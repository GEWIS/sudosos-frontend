import { BaseEntity } from '@/entities/BaseEntity';

export interface Advertisement extends BaseEntity {
  id: number;
  picture: string;
  duration: number;
  active: boolean;
  startDate: Date;
  endDate: Date;
}
