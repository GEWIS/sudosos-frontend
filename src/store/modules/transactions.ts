import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import APIHelper from '@/mixins/APIHelper';
import { Transaction } from '@/entities/Transaction';
import TransactionTransformer from '@/transformers/TransactionTransformer';

@Module({ namespaced: true, name: 'transactions' })
export default class TransactionModule extends VuexModule {
  transactions: Transaction[] = [];

  get getTransactions() {
    if (this.transactions.length === 0) {
      this.fetchTransactions();
    }
    return this.transactions;
  }

  @Mutation
  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  @Action
  fetchTransactions() {
    const transactionResponse = APIHelper.getResource('transactions') as [];
    transactionResponse.map(transaction => TransactionTransformer.makeTransaction(transaction));
    this.context.commit('setTransactions', transactionResponse);
  }
}
