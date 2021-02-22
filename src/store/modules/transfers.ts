import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import APIHelper from '@/mixins/APIHelper';
import { Transfer } from '@/entities/Transfer';
import TransferTransformer from '@/transformers/TransferTransformer';
import store from '@/store';

@Module({ dynamic: true, store, name: 'TransferModule' })
export default class TransferModule extends VuexModule {
  transfers: Transfer[] = [];

  @Mutation
  setTransfers(transfers: Transfer[]) {
    this.transfers = transfers;
  }

  @Mutation
  addTransfer(transfer: Transfer) {
    const transferResponse = APIHelper.postResource('transfers', transfer);
    this.transfers.push(TransferTransformer.makeTransfer(transferResponse));
  }

  @Mutation
  removeTransfer(transfer: Transfer) {
    APIHelper.delResource('transfers', transfer);
    const index = this.transfers.findIndex(trns => trns.id === transfer.id);
    this.transfers.splice(index, 1);
  }

  @Mutation
  updateTransfer(transfer: {}) {
    const response = APIHelper.putResource('transfers', transfer);
    const transferResponse = TransferTransformer.makeTransfer(response);
    const index = this.transfers.findIndex(trnsfr => trnsfr.id === transferResponse.id);
    this.transfers[index] = transferResponse;
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchTransfers(force: boolean = false) {
    if (this.transfers.length === 0 || force) {
      const transferResponse = APIHelper.getResource('transfers') as [];
      const transfers = transferResponse.map(trnsfr => TransferTransformer.makeTransfer(trnsfr));
      this.context.commit('setTransfers', transfers);
    }
  }
}
