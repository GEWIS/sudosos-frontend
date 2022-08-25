import { Dinero } from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import { Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';
import { SubTransactionRow } from '@/entities/SubTransactionRow';

export interface SubTransaction extends BaseEntity {
  to: BaseUser | User;
  container: Container;
  subTransactionRows: SubTransactionRow[];
  price: Dinero;
}
