import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import APIHelper from '@/mixins/APIHelper';
import { Transfer } from '@/entities/Transfer';
import TransferTransformer from '@/transformers/TransferTransformer';

@Module({ namespaced: true, name: 'transfers' })
export default class TransferModule extends VuexModule {
  transfers: Transfer[] = [];

  get getTransfers() {
    if (this.transfers.length === 0) {
      this.fetchTransfers();
    }
    return this.transfers;
  }

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
    const index = this.transfers.findIndex(trns => trns.id === transferResponse.id);
    this.transfers[index] = transferResponse;
  }

  @Action
  fetchTransfers() {
    const transferResponse = APIHelper.getResource('transfers') as [];
    transferResponse.map(transfer => TransferTransformer.makeTransfer(transfer));
    this.context.commit('setTransfers', transferResponse);
  }
}
