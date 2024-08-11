import type {
    BasePayoutRequestResponse,
    PaginatedBasePayoutRequestResponse, PayoutRequestRequest,
    PayoutRequestResponse
} from "@sudosos/sudosos-client";
import { defineStore } from "pinia";
import apiService from "@/services/ApiService";
import { isArray } from "lodash";
import { PayoutRequestStatusRequestStateEnum } from "@sudosos/sudosos-client";

export type PayoutResponse = PayoutRequestResponse | BasePayoutRequestResponse;
export const usePayoutStore = defineStore('payout', {
    state: () => ({
        payouts: {} as Record<number,PayoutResponse>,
        pending: 0,
    }),
    getters: {
        getStatePayout: (state) => (payoutState: PayoutRequestStatusRequestStateEnum): PayoutResponse[] => {
            return Object.values(state.payouts).filter((payout) => {
                if (isArray(payout.status) && payout.status) {
                    if (payout.status[payout.status.length - 1].state === payoutState) return true;
                } else {
                    if (payout.status && payout.status === payoutState) return true;
                }
                return false;
            });
        },
        getPayout: (state) => (id: number): PayoutResponse | null => {
            return state.payouts[id] || null;
        },
        getAllPayouts(): Record<number, PayoutResponse> {
            return this.payouts;
        }
    },
    actions: {
        async fetchPayouts(take: number, skip: number, state?: string): Promise<PaginatedBasePayoutRequestResponse> {
            return apiService.payouts.getAllPayoutRequests(undefined, undefined,undefined,
              undefined, state, take, skip).then((res) => {
                  res.data.records.forEach((payout: BasePayoutRequestResponse) => {
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
        async denyPayout(id: number): Promise<PayoutRequestResponse> {
            return apiService.payouts.setPayoutRequestStatus(id, { state: "DENIED" }).then((res) => {
                this.payouts[id] = res.data;
                this.pending--;
                return res.data;
            });
        },
        async approvePayout(id: number): Promise<PayoutRequestResponse> {
            return apiService.payouts.setPayoutRequestStatus(id, { state: "APPROVED" }).then((res) => {
                this.payouts[id] = res.data;
                this.pending--;
                return res.data;
            });
        },
        async fetchPdf(id: number): Promise<string> {
            return apiService.payouts.getPayoutRequestPdf(id).then((res) => {
                const pdf = (res.data as any as { pdf: string }).pdf;
                this.payouts[id].pdf = pdf;
                return pdf;
            });
        },
        async createPayout(values: PayoutRequestRequest): Promise<PayoutRequestResponse> {
            return apiService.payouts.createPayoutRequest(values).then((res) => {
                this.payouts[res.data.id] = res.data;
                this.pending++;
                return res.data;
            });
        },
        async fetchPending(): Promise<number> {
            return apiService.payouts.getAllPayoutRequests(undefined, undefined,undefined,
              undefined, 'CREATED', 0, 0, undefined).then((res) => {
                  this.pending = res.data._pagination.count;
                  return this.pending;
            });
        },
    },
});
