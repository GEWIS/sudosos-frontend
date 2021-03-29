import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { POSTransaction, Transaction } from '@/entities/Transaction';
import TransactionTransformer from '@/transformers/TransactionTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'TransactionModule',
})
export default class TransactionModule extends VuexModule {
  transactions: Transaction[] = [];

  posTransactions: POSTransaction[] = [];

  @Mutation
  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  @Mutation
  addTransaction(transaction: Transaction) {
    const transactionResponse = APIHelper.postResource('transactions', transaction);
    this.transactions.push(TransactionTransformer.makeTransaction(transactionResponse));
  }

  @Mutation
  removeTransaction(transaction: Transaction) {
    APIHelper.delResource('transactions', transaction);
    const index = this.transactions.findIndex(trns => trns.id === transaction.id);
    this.transactions.splice(index, 1);
  }

  @Mutation
  updateTransaction(transaction: {}) {
    const response = APIHelper.putResource('transactions', transaction);
    const transactionResponse = TransactionTransformer.makeTransaction(response);
    const index = this.transactions.findIndex(trns => trns.id === transactionResponse.id);
    this.transactions.splice(index, 1, transactionResponse);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchTransactions(force: boolean = false) {
    if (this.transactions.length === 0 || force) {
      const transactionResponse = APIHelper.getResource('transactions') as [];
      const trans = transactionResponse.map(trns => TransactionTransformer.makeTransaction(trns));
      this.context.commit('setTransactions', trans);
    }
  }

  @Mutation
  addPOSTransaction(transaction: POSTransaction) {
    this.posTransactions.push(transaction);
  }

  @Mutation
  updatePOSTransaction(transaction: POSTransaction) {
    const index = this.posTransactions.findIndex(pos => pos.id === transaction.id);
    this.posTransactions.splice(index, 1, transaction);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchPOSTransactions(posID: number, force: boolean = false) {
    const index = this.posTransactions.findIndex(pos => pos.id === posID);

    // If the transactions for this POS have not been resolved yet resolve them.
    if (index === -1 || force) {
      const transactionResponse = APIHelper.getResource(`transactionPOS?id=${posID}`) as [];
      const trans = transactionResponse.map(trns => TransactionTransformer.makeTransaction(trns));

      this.context.commit('addPOSTransaction', {
        id: posID,
        transactions: trans,
      } as POSTransaction);
    }
  }
}
