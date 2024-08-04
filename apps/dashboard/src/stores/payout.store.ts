import type { PaginatedBasePayoutRequestResponse, PayoutRequestResponse } from "@sudosos/sudosos-client";
import { defineStore } from "pinia";
import apiService from "@/services/ApiService";

export const usePayoutStore = defineStore('payout', {
    state: () => ({
        payouts: {} as Record<number, PayoutRequestResponse>,
    }),
    getters: {
        getPayout: (state) => (id: number): PayoutRequestResponse | null => {
            return state.payouts[id] || null;
        },
        getAllPayouts(): Record<number, PayoutRequestResponse> {
            return this.payouts;
        }
    },
    actions: {
        async fetchPayouts(take: number, skip: number, state?: string): Promise<PaginatedBasePayoutRequestResponse> {
            return apiService.payouts.getAllPayoutRequests(undefined, undefined,undefined,
              undefined, state, take, skip).then((res) => {
                  res.data.records.forEach((payout: PayoutRequestResponse) => {
                      this.payouts[payout.id] = payout;
                  });
                  return res.data;
            });
        },
        async fetchPayout(id: number): Promise<PayoutRequestResponse> {
            return apiService.payouts.getSinglePayoutRequest(id).then((res) => {
                this.payouts[id] = res.data;
                return res.data;
            });
        },
        async fetchPdf(id: number): Promise<string> {
            return apiService.payouts.getPayoutRequestPdf(id).then((res) => {
                this.payouts[id].pdf = res.data.pdf;
                return res.data.pdf;
            });
        }
    },
});
