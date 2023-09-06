import { BaseEntity } from '@/entities/BaseEntity';
import dinero from 'dinero.js';

export interface Fine extends BaseEntity {
  amount: dinero.Dinero;
}
