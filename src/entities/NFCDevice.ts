import { BaseEntity } from '@/entities/BaseEntity';

export interface NFCDevice extends BaseEntity {
  name: string;
  address: string;
}
