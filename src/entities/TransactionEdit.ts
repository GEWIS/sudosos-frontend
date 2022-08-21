import { Product } from '@/entities/Product';
import { Container } from '@/entities/Container';
import { Dinero } from 'dinero.js';
import { Transaction } from '@/entities/Transaction';

export interface TransactionEdit {
  product: Product;
  container: Container;
  amount: number;
  totalPrice: Dinero;
}

export function parseTransaction(transaction: Transaction) {
  const transEdits: TransactionEdit[] = [];

  transaction.subTransactions.forEach((subTrans) => {
    subTrans.subTransactionRows.forEach((subTransRow) => {
      const transEdit = {
        product: subTransRow.product,
        container: subTrans.container,
        amount: subTransRow.amount,
        totalPrice: subTransRow.price,
      };
      transEdits.push(transEdit);
    });
  });

  return transEdits;
}
