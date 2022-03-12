import APIHelper from '@/mixins/APIHelper';
import TransactionTransformer from '@/transformers/TransactionTransformer';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import { TransactionFilter } from '@/entities/Transaction';

export function getTransactions(
  filter: TransactionFilter, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...filter,
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('transactions', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (transaction: any) => TransactionTransformer.makeTransaction(transaction),
    );

    return response;
  });
}

export function postTransaction(transaction: any) {
  return APIHelper.postResource('transactions', transaction).then((response) => TransactionTransformer.makeTransaction(response));
}

export function getTransaction(id: number) {
  return APIHelper.getResource(`transactions/${id}`).then((response) => TransactionTransformer.makeTransaction(response));
}

export function patchTransaction(id: number, transaction: any) {
  return APIHelper.patchResource(`transactions/${id}`, transaction).then((response) => TransactionTransformer.makeTransaction(response));
}

export function deleteTransaction(id: number) {
  return APIHelper.delResource(`transactions/${id}`);
}

export function getUserTransactions(
  id: number, filter: TransactionFilter, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...filter,
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/transactions`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (transaction: any) => TransactionTransformer.makeTransaction(transaction),
    );

    return response;
  });
}
