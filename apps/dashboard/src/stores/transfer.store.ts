import { defineStore } from 'pinia';
import type { TransferResponse } from '@sudosos/sudosos-client';
import type { ApiService } from '@sudosos/sudosos-frontend-common';

interface TransferStoreModuleState {
  transfer: TransferResponse | null;
}

export const useTransferStore = defineStore('transfer', {
  state: (): TransferStoreModuleState => ({
    transfer: null,
    transfers: {} as Record<number, TransferResponse>,
  }),
  getters: {
    getTransfer:
      (state) =>
      (id: number): TransferResponse | null => {
        return state.transfers[id] || null;
      },
  },
  actions: {
    async fetchIndividualTransfer(id: number, service: ApiService): Promise<void> {
      if (this.transfers[id]) return this.transfers[id];
      return service.transfers.getSingleTransfer(id).then((res) => {
        this.transfers[id] = res.data;
        return res.data;
      });
    },
  },
});
