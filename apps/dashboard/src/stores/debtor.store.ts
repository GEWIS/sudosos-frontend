import { defineStore } from "pinia";
import type { UserResponse, UserToFineResponse } from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";

export enum SortField {
    NAME = "name",
    FINE = "fine",
    FINE_SINCE = "fineSince",
    PRIMARY_BALANCE = "primaryBalance",
    SECONDARY_BALANCE = "secondaryBalance",
}

export enum SortDirection {
    NONE = 0,
    ASCENDING = -1,
    DESCENDING = 1,
}

export interface DebtorSort {
    field: SortField | null;
    direction: SortDirection | null;
}

export interface DebtorFilter {
    name: string;
}

interface Debtor {
    fine: UserToFineResponse,
    user: UserResponse,
}

interface DebtorState {
    debtors: Debtor[];
    userToFineResponse: UserToFineResponse[];
    isLoading: boolean;
}

export const useDebtorStore = defineStore('debtor', {
    state: (): DebtorState => ({
        debtors: [],
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
         * @param filter Filter based on name
         * @param sort Sort based on fine, fineSince, primaryBalance and secondaryBalance
         * @return
         */
        async fetchDebtorLazy(take: number, skip: number, filter: DebtorFilter, sort: DebtorSort) {
            this.isLoading = true;
            const debtors: Debtor[] = [];
            const userToFineResponse = this.userToFineResponse.slice();
            switch (sort.field) {
                case SortField.NAME: {
                    userToFineResponse.sort((a, b) => {
                        const aFullName = (a.balances[0].firstName + " " + a.balances[0].lastName).toLowerCase();
                        const bFullName = (b.balances[0].firstName + " " + b.balances[0].lastName).toLowerCase();

                        return ((aFullName > bFullName)
                            ? 1 : -1)
                            * (sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.FINE: {
                    userToFineResponse.sort((a, b) => {
                       return ((a.balances[0].fine?.amount || 0) - (b.balances[0].fine?.amount || 0))
                           * (sort.direction || 1);
                    });
                    break;
                }
                case SortField.FINE_SINCE: {
                    userToFineResponse.sort((a, b) => {
                        const dateA = a.balances[0].fineSince
                            ? new Date(a.balances[0].fineSince)
                            : new Date();
                        const dateB = b.balances[0].fineSince
                            ? new Date(b.balances[0].fineSince)
                            : new Date();
                        return (dateA.getTime() - dateB.getTime()) * (sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.PRIMARY_BALANCE: {
                    userToFineResponse.sort((a, b) => {
                        return (a.balances[0].amount.amount - b.balances[0].amount.amount) * (sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.SECONDARY_BALANCE: {
                    userToFineResponse.sort((a, b) => {
                        return (a.balances[1].amount.amount - b.balances[1].amount.amount) * (sort.direction || 1)*-1;
                    });
                    break;
                }
            }

            let extra = 0;
            for(let i = skip; i < skip+take+extra; i++) {
                if (userToFineResponse[i] == undefined) {
                    continue;
                }

                if (!(
                    userToFineResponse[i].balances[0].firstName
                    + " "
                    + userToFineResponse[i].balances[0].lastName)
                    .toLowerCase()
                    .includes(filter.name.toLowerCase())
                ) {
                    extra++;
                    continue;
                }

                const user = (await ApiService.user.getIndividualUser(userToFineResponse[i].id)).data;

                debtors.push({
                    user: user,
                    fine: userToFineResponse[i]
                });
            }
            this.debtors = debtors;
            this.isLoading = false;
            return debtors;
        }
    }
});