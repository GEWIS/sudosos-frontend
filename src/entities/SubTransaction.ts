import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { Container } from '@/entities/Container';

export interface SubTransaction {
  id: number;
  to: User;
  transaction: Transaction;
  container: Container;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
