import { defineStore } from "pinia";
import type { UserResponse, UserToFineResponse } from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";

interface DebtorState {
    debtors: Record<number, {
        fine: UserToFineResponse,
        user: UserResponse,
    }>;
    userToFineResponse: UserToFineResponse[];
    isLoading: boolean;
}

export const useDebtorStore = defineStore('debtor', {
    state: (): DebtorState => ({
        debtors: {},
        userToFineResponse: [],
        isLoading: false
    }),
    getters: {

    },
    actions: {
        /**
         * Calculates and populates the user state
         *
         * @param firstReferenceDate The first date for fine calculation
         * @param secondReferenceDate The second date for fine calculation (usually today)
         */
        async fetchCalculatedFines(firstReferenceDate: Date, secondReferenceDate?: Date) {
            const dates = [firstReferenceDate.toISOString()];
            if (secondReferenceDate) {
                dates.push(secondReferenceDate.toISOString());
            }

            // Don't calculate fines for ORGAN, VOUCHER, LOCAL_ADMIN, INVOICE, AUTOMATIC_INVOICE
            const userToFine = (await ApiService.debtor.calculateFines(dates, [
                "MEMBER",
                "LOCAL_USER",
            ])).data;

            this.userToFineResponse = userToFine;
        },
        /**
         * This functions turns the users received from `fetchCalculatedFines`
         * into usuable objects together with the user response.
         *
         * @param take How much you want to take
         * @param skip How much you want to skip
         * @return
         */
        async fetchPaginatedDebtors(take: number, skip: number) {
            const debtors: Record<number, {
                fine: UserToFineResponse,
                user: UserResponse,
            }> = [];

            for(let i = skip; i < skip+take; i++) {
                if (this.userToFineResponse[i] == undefined) {
                    continue;
                }

                const user = (await ApiService.user.getIndividualUser(this.userToFineResponse[i].id)).data;

                debtors[user.id] = {
                    user: user,
                    fine: this.userToFineResponse[i]
                };
            }

            return debtors;
        }
    }
});