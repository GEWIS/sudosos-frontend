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
  userTransactions: Transaction[] = [];

  posTransactions: POSTransaction[] = [];

  @Mutation
  reset() {
    this.userTransactions = [];
    this.posTransactions = [];
  }

  @Mutation
  setTransactions(transactions: Transaction[]) {
    this.userTransactions = transactions;
  }

  @Mutation
  addTransaction(transaction: Transaction) {
    const transactionResponse = APIHelper.postResource('transactions', transaction);
    this.userTransactions.push(TransactionTransformer.makeTransaction(transactionResponse));
  }

  @Mutation
  removeTransaction(transaction: Transaction) {
    APIHelper.delResource('transactions', transaction);
    const index = this.userTransactions.findIndex((trns) => trns.id === transaction.id);
    this.userTransactions.splice(index, 1);
  }

  @Mutation
  updateTransaction(transaction: {}) {
    const response = APIHelper.putResource('transactions', transaction);
    const transactionResponse = TransactionTransformer.makeTransaction(response);
    const index = this.userTransactions.findIndex((trns) => trns.id === transactionResponse.id);
    this.userTransactions.splice(index, 1, transactionResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchUsersTransactions(userID: number, force: boolean = false) {
    if (this.userTransactions.length === 0 || force) {
      APIHelper.getResource(`users/${userID}/transactions`).then((transResponse) => {
        const trans = transResponse.map(
          (trns: any) => TransactionTransformer.makeTransaction(trns),
        );
        this.context.commit('setTransactions', trans);
      });
    }
  }

  @Mutation
  addPOSTransaction(transaction: POSTransaction) {
    this.posTransactions.push(transaction);
  }

  @Mutation
  updatePOSTransaction(transaction: POSTransaction) {
    const index = this.posTransactions.findIndex((pos) => pos.id === transaction.id);
    this.posTransactions.splice(index, 1, transaction);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchPOSTransactions(posID: number, force: boolean = false) {
    const index = this.posTransactions.findIndex((pos) => pos.id === posID);

    // If the transactions for this POS have not been resolved yet resolve them.
    if (index === -1 || force) {
      APIHelper.getResource(`transactionPOS?id=${posID}`).then((transactionResponse) => {
        const trans = transactionResponse.map(
          (trns: any) => TransactionTransformer.makeTransaction(trns),
        );

        this.context.commit('addPOSTransaction', {
          id: posID,
          transactions: trans,
        } as POSTransaction);
      });
    }
  }
}
