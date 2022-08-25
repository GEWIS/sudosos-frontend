import { Pagination } from '@/entities/Pagination';
import { Transaction } from '@/entities/Transaction';
import { Transfer } from '@/entities/Transfer';

export type FinancialMutation = Transaction | Transfer;

export interface FinancialMutationList {
  _pagination: Pagination,
  records: FinancialMutation[],
}
