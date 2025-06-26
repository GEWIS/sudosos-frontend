import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';

export function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  const result: Array<SubTransactionRowResponse> = [];
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      result.push(subTransactionRow);
    });
  });
  return result;
}
