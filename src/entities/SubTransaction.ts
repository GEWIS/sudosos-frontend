import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';

export interface SubTransaction extends BaseEntity {
  id: number;
  to: User;
  transaction: Transaction;
  container: Container;
}
