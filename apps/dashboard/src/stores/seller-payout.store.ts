import { defineStore } from "pinia";
import ApiService from "@/services/ApiService";
import type { PaginatedSellerPayoutResponse, SellerPayoutResponse } from "@sudosos/sudosos-client";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

export const useSellerPayoutStore = defineStore('seller-payout', {
    state: () => ({
        payouts: {} as Record<number, SellerPayoutResponse>,
    }),
    getters: {
        getPayout: (state) => (id: number): SellerPayoutResponse | undefined => {
            return state.payouts[id];
        },
        getAll(state): Record<number, SellerPayoutResponse> {
            return state.payouts;
        },
    },
    actions: {
        async fetchPayout(id: number): Promise<SellerPayoutResponse> {
            return await ApiService.sellerPayouts.getSingleSellerPayout(id).then((res) => {
                const payout = res.data;
                this.payouts[payout.id] = payout;
                return this.payouts[payout.id];
            });
        },
        async fetchPayouts(take: number, skip: number): Promise<PaginatedSellerPayoutResponse> {
            return await ApiService.sellerPayouts
              .getAllSellerPayouts(undefined, undefined, undefined, take, skip).then((res) => {
                const payouts = res.data.records as SellerPayoutResponse[];
                payouts.forEach((payout) => {
                    this.payouts[payout.id] = payout;
                });
                return res.data;
            });
        },
        async fetchPayoutsBy(requestedById: number, take: number, skip: number)
          : Promise<PaginatedSellerPayoutResponse> {
            return await ApiService.sellerPayouts
              .getAllSellerPayouts(requestedById, undefined, undefined, take, skip).then((res) => {
                  const payouts = res.data.records as SellerPayoutResponse[];
                  payouts.forEach((payout) => {
                      this.payouts[payout.id] = payout;
                  });
                  return res.data;
              });
        },
        async fetchAllIfEmpty() {
            if (Object.keys(this.payouts).length === 0) {
                await this.fetchAll();
            }
        },
        async fetchAll(): Promise<Record<number, SellerPayoutResponse>> {
            return fetchAllPages<SellerPayoutResponse>(
                0,
                500,
                // @ts-ignore
                (take, skip) => ApiService.sellerPayouts
                  .getAllSellerPayouts(undefined, undefined, undefined, take, skip)
            ).then((payouts) => {
                payouts.forEach((payout: SellerPayoutResponse) => {
                    this.payouts[payout.id] = payout;
                });
                return this.payouts;
            });
        },
    }
});
