import type {
  TransactionResponse,
  TransactionRequest,
  SubTransactionRequest,
  SubTransactionRowRequest,
} from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';

export function getProductsOfTransaction(transactionResponse: TransactionResponse): SubTransactionRowResponse[] {
  return transactionResponse.subTransactions.flatMap(
    (subTransaction: SubTransactionResponse) => subTransaction.subTransactionRows,
  );
}

/**
 * Maps a TransactionResponse to a TransactionRequest format for API updates.
 * This is required because the update API expects a complete transaction structure.
 */
export function transactionResponseToRequest(transaction: TransactionResponse): TransactionRequest {
  const subTransactions: SubTransactionRequest[] = transaction.subTransactions.map((subTransaction) => ({
    to: subTransaction.to.id,
    container: {
      id: subTransaction.container.id,
      revision: subTransaction.container.revision,
    },
    subTransactionRows: subTransaction.subTransactionRows.map(
      (row): SubTransactionRowRequest => ({
        amount: row.amount,
        product: {
          id: row.product.id,
          revision: row.product.revision,
        },
        totalPriceInclVat: row.totalPriceInclVat,
      }),
    ),
    totalPriceInclVat: subTransaction.totalPriceInclVat,
  }));

  return {
    from: transaction.from.id,
    createdBy: transaction.createdBy.id,
    pointOfSale: {
      id: transaction.pointOfSale.id,
      revision: transaction.pointOfSale.revision,
    },
    subTransactions,
    totalPriceInclVat: transaction.totalPriceInclVat,
  };
}
