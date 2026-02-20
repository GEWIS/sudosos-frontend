import { defineStore } from 'pinia';
import type { FinancialMutationResponse, SellerPayoutResponse, UserResponse } from '@sudosos/sudosos-client';
import { fetchAllPages, fetchAllPagesParallel } from '@sudosos/sudosos-frontend-common';
import ApiService from '@/services/ApiService';
import { USER_TYPES } from '@/utils/validation-schema';

interface FinancialOverviewState {
  sellers: UserResponse[];
  mutations: Record<number, FinancialMutationResponse[]>;
  payouts: Record<number, SellerPayoutResponse[]>;
  isLoading: boolean;
}

export const useFinancialOverviewStore = defineStore('financialOverview', {
  state: (): FinancialOverviewState => ({
    sellers: [],
    mutations: {} as Record<number, FinancialMutationResponse[]>,
    payouts: {} as Record<number, SellerPayoutResponse[]>,
    isLoading: false,
  }),
  getters: {
    getSellers: (state) => {
      return state.sellers;
    },
    getMutations: (state) => {
      return state.mutations;
    },
  },
  actions: {
    async fetchAllSellerUsers() {
      this.isLoading = true;
      try {
        this.sellers = await fetchAllPages<UserResponse>((take, skip) =>
          ApiService.user.getAllUsersOfUserType(USER_TYPES.ORGAN, take, skip),
        );
      } finally {
        this.isLoading = false;
      }
    },
    async fetchFinancialMutationsForAllSellers(fromDate: string, tillDate: string) {
      this.isLoading = true;
      try {
        const results = await Promise.all(
          this.sellers.map((seller) =>
            fetchAllPagesParallel<FinancialMutationResponse>((take, skip) =>
              ApiService.user.getUsersFinancialMutations(seller.id, fromDate, tillDate, take, skip),
            ).then((mutations) => ({ id: seller.id, mutations })),
          ),
        );
        for (const { id, mutations } of results) {
          this.mutations[id] = mutations;
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSellerPayoutsForAllSellers(fromDate: string, tillDate: string) {
      this.isLoading = true;
      try {
        const results = await Promise.all(
          this.sellers.map((seller) =>
            fetchAllPagesParallel<SellerPayoutResponse>((take, skip) =>
              ApiService.sellerPayouts.getAllSellerPayouts(seller.id, fromDate, tillDate, take, skip),
            ).then((payouts) => ({ id: seller.id, payouts })),
          ),
        );
        for (const { id, payouts } of results) {
          this.payouts[id] = payouts;
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
