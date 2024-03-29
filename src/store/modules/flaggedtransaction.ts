import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { FlaggedTransaction } from '@/entities/FlaggedTransaction';
import FlaggedTransactionTransformer from '@/transformers/FlaggedTransactionTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'FlaggedTransactionsModule',
})
export default class FlaggedTransactionModule extends VuexModule {
  flaggedTransactions: FlaggedTransaction[] = [];

  @Mutation
  reset() {
    this.flaggedTransactions = [];
  }

  @Mutation
  setFlaggedTransactions(flaggedTransactions: FlaggedTransaction[]) {
    this.flaggedTransactions = flaggedTransactions;
  }

  @Mutation
  addFlaggedTransaction(flaggedTransaction: object) {
    const flaggedTransactionResponse = APIHelper.postResource('flaggedTransactions', flaggedTransaction);
    this.flaggedTransactions.push(
      FlaggedTransactionTransformer.makeFlaggedTransaction(flaggedTransactionResponse),
    );
  }

  @Mutation
  removeFlaggedTransaction(flaggedTransaction: FlaggedTransaction) {
    APIHelper.delResource('flaggedTransactions').then(() => {
      const index = this.flaggedTransactions.findIndex((trns) => trns.id === flaggedTransaction.id);
      this.flaggedTransactions.splice(index, 1);
    });
  }

  @Mutation
  updateFlaggedTransaction(flaggedTransaction: {}) {
    const response = APIHelper.putResource('flaggedTransactions', flaggedTransaction);
    const flaggedTransactionResponse = FlaggedTransactionTransformer.makeFlaggedTransaction(
      response,
    );
    const index = this.flaggedTransactions.findIndex((trns) => (
      trns.id === flaggedTransactionResponse.id
    ));
    this.flaggedTransactions.splice(index, 1, flaggedTransactionResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchFlaggedTransactions(force: boolean = false) {
    if (this.flaggedTransactions.length === 0 || force) {
      APIHelper.getResource('flaggedTransactions').then((flaggedTransactionResponse: FlaggedTransaction[]) => {
        const flgd = flaggedTransactionResponse.map((flaggedTransaction) => (
          FlaggedTransactionTransformer.makeFlaggedTransaction(flaggedTransaction)
        ));
        this.context.commit('setFlaggedTransactions', flgd);
      });
    }
  }
}
