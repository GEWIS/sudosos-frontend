import { defineStore } from 'pinia';
import type { FinancialMutationResponse, SellerPayoutResponse, UserResponse } from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
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
        for (const seller of this.sellers) {
          this.mutations[seller.id] = await fetchAllPages<FinancialMutationResponse>((take, skip) =>
            ApiService.user.getUsersFinancialMutations(seller.id, fromDate, tillDate, take, skip),
          );
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSellerPayoutsForAllSellers(fromDate: string, tillDate: string) {
      this.isLoading = true;
      try {
        for (const seller of this.sellers) {
          this.payouts[seller.id] = await fetchAllPages<SellerPayoutResponse>((take, skip) =>
            ApiService.sellerPayouts.getAllSellerPayouts(seller.id, fromDate, tillDate, take, skip),
          );
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
