/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import APIHelper from '@/mixins/APIHelper';
import { FlaggedTransaction } from '@/entities/FlaggedTransaction';
import FlaggedTransactionTransformer from '@/transformers/FlaggedTransactionTransformer';

@Module({ namespaced: true, name: 'flaggedTransactions' })
export default class FlaggedTransactionModule extends VuexModule {
  flaggedTransactions: FlaggedTransaction[] = [];

  get getFlaggedTransactions() {
    if (this.flaggedTransactions.length === 0) {
      this.fetchFlaggedTransactions();
    }
    return this.flaggedTransactions;
  }

  @Mutation
  setFlaggedTransactions(flaggedTransactions: FlaggedTransaction[]) {
    this.flaggedTransactions = flaggedTransactions;
  }

  @Mutation
  addFlaggedTransaction(flaggedTransaction: FlaggedTransaction) {
    const flaggedTransactionResponse = APIHelper.postResource('flaggedTransactions', flaggedTransaction);
    this.flaggedTransactions.push(FlaggedTransactionTransformer.makeFlaggedTransaction(flaggedTransactionResponse));
  }

  @Mutation
  removeFlaggedTransaction(flaggedTransaction: FlaggedTransaction) {
    APIHelper.delResource('flaggedTransactions', flaggedTransaction);
    const index = this.flaggedTransactions.findIndex(trns => trns.id === flaggedTransaction.id);
    this.flaggedTransactions.splice(index, 1);
  }

  @Mutation
  updateFlaggedTransaction(flaggedTransaction: {}) {
    const response = APIHelper.putResource('flaggedTransactions', flaggedTransaction);
    const flaggedTransactionResponse = FlaggedTransactionTransformer.makeFlaggedTransaction(response);
    const index = this.flaggedTransactions.findIndex(trns => trns.id === flaggedTransactionResponse.id);
    this.flaggedTransactions[index] = flaggedTransactionResponse;
  }

  @Action
  fetchFlaggedTransactions() {
    const flaggedTransactionResponse = APIHelper.getResource('flaggedTransactions') as [];
    flaggedTransactionResponse.map(flaggedTransaction => FlaggedTransactionTransformer.makeFlaggedTransaction(flaggedTransaction));
    this.context.commit('setFlaggedTransactions', flaggedTransactionResponse);
  }
}
