import { TransactionFilter } from '@/entities/Transaction';
import APIHelper from '@/mixins/APIHelper';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import TransactionTransformer from '@/transformers/TransactionTransformer';
import TransferTransformer from '@/transformers/TransferTransformer';

export default function getUserFinancialMutations(
  id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/financialmutations`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (transaction: any) => {
        if (transaction.type === 'transaction') return TransactionTransformer.makeTransaction(transaction.mutation);
        if (transaction.type === 'transfer') return TransferTransformer.makeTransfer(transaction.mutation);
        return undefined;
      },
    );

    return response;
  });
}
