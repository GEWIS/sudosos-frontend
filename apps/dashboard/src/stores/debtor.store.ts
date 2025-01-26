import {defineStore} from "pinia";
import type {UserResponse, UserToFineResponse} from "@sudosos/sudosos-client";
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
         * @param primaryDate The first date for fine calculation
         * @param secondaryDate The second date for fine calculation (usually today)
         */
        async fetchCalculatedFines(primaryDate: Date, secondaryDate?: Date) {
            const dates = [primaryDate.toISOString()];
            if (secondaryDate) {
                dates.push(secondaryDate.toISOString());
            }

            // Don't calculate fines for ORGAN, VOUCHER, LOCAL_ADMIN, INVOICE, AUTOMATIC_INVOICE
            this.userToFineResponse = (await ApiService.debtor.calculateFines(dates, [
                "MEMBER",
                "LOCAL_USER",
            ])).data;
        },
        /**
         * This functions turns the users received from `fetchCalculatedFines`
         * into lazy loading objects together with the user response.
         *
         * @param take How much you want to take
         * @param skip How much you want to skip
         * @param nameFilter Filter based on name
         * @return
         */
        async fetchLazyDebtors(take: number, skip: number, nameFilter: string) {
            const debtors: Record<number, {
                fine: UserToFineResponse,
                user: UserResponse,
            }> = {};

            let extra = 0;
            for(let i = skip; i < skip+take+extra; i++) {
                console.log(i);
                if (this.userToFineResponse[i] == undefined) {
                    continue;
                }

                if (!(
                    this.userToFineResponse[i].balances[0].firstName
                    + " "
                    + this.userToFineResponse[i].balances[0].lastName)
                    .toLowerCase()
                    .includes(nameFilter.toLowerCase())
                ) {
                    extra++;
                    continue;
                }

                const user = (await ApiService.user.getIndividualUser(this.userToFineResponse[i].id)).data;

                debtors[user.id] = {
                    user: user,
                    fine: this.userToFineResponse[i]
                };
            }
            this.debtors = debtors;
            return debtors;
        }
    }
});