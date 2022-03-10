import APIHelper from '@/mixins/APIHelper';
import TransactionTransformer from '@/transformers/TransactionTransformer';

export function getTransactions(args: Object | null = null) {
  return APIHelper.getResource('transactions', args).then((transResponse) => {
    transResponse.records.map(
      (transaction: any) => TransactionTransformer.makeTransaction(transaction),
    );

    return transResponse;
  });
}

export function getUserTransactions(id: number, args: Object | null = null) {
  return APIHelper.getResource(`users/${id}/transactions`, args).then((transResponse) => {
    transResponse.records.map(
      (transaction: any) => TransactionTransformer.makeTransaction(transaction),
    );
  });
}

export function getTransaction(id: number) {
  return APIHelper.getResource(`transactions/${id}`).then((transactionResponse) => TransactionTransformer.makeTransaction(transactionResponse));
}
