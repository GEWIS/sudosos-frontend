import APIHelper from '@/mixins/APIHelper';
import TransferTransformer from '@/transformers/TransferTransformer';

export function getTransfers(args: Object | null = null) {
  return APIHelper.getResource('transfers', args).then((transfers) => transfers.map(
    (transfer: any) => TransferTransformer.makeTransfer(transfer),
  ));
}

export function getUserTransfers(id: number, args: Object | null = null) {
  return APIHelper.getResource(`users/${id}/transfers`, args).then((transfers) => transfers.map(
    (transfer: any) => TransferTransformer.makeTransfer(transfer),
  ));
}
