import APIHelper from '@/mixins/APIHelper';
import TransferTransformer from '@/transformers/TransferTransformer';
import PaginationTransformer from '@/transformers/PaginationTransformer';
import { TransferFilter } from '@/entities/Transfer';

export function getTransfers(take: number | null = null, skip: number | null = null) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource('transfers', body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (transfer: any) => TransferTransformer.makeTransfer(transfer),
    );

    return response;
  });
}

export function postTransfer(transfer: any) {
  return APIHelper.postResource('transfers', transfer).then((response) => TransferTransformer.makeTransfer(response));
}

export function getTransfer(id: number) {
  return APIHelper.getResource(`transfers/${id}`).then((response) => TransferTransformer.makeTransfer(response));
}

export function getUserTransfers(
  filter: TransferFilter, id: number, take: number | null = null, skip: number | null = null,
) {
  const body = {
    ...take && { take },
    ...skip && { skip },
  };

  return APIHelper.getResource(`users/${id}/transfers`, body).then((response) => {
    response._pagination = PaginationTransformer.makePagination(response._pagination);
    response.records = response.records.map(
      (transfer: any) => TransferTransformer.makeTransfer(transfer),
    );

    return response;
  });
}
