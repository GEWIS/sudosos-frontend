import { defineStore } from "pinia";
import type {
    BalanceResponse,
    FineHandoutEventResponse,
    GewisUserResponse,
    UserToFineResponse
} from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";
import Dinero from "dinero.js";
import { fetchAllPages } from "@sudosos/sudosos-frontend-common";

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
    user: GewisUserResponse,
}

interface FinancialSummary {
    totalNegative: Dinero.DineroObject;
    totalPositive: Dinero.DineroObject;
    total: Dinero.DineroObject;
}

interface DebtorState {
    allDebtors: Debtor[];
    userToFineResponse: UserToFineResponse[];
    isDebtorsLoading: boolean;
    sort: DebtorSort;
    filter: DebtorFilter;
    isFineHandoutEventsLoading: boolean;
    fineHandoutEvents: FineHandoutEventResponse[];
    summary: FinancialSummary;
}

export const useDebtorStore = defineStore('debtor', {
    state: (): DebtorState => ({
        allDebtors: [],
        userToFineResponse: [],
        isDebtorsLoading: true,
        sort: {
            field: null,
            direction: null
        },
        filter: {
            name: ""
        },
        isFineHandoutEventsLoading: true,
        fineHandoutEvents: [],
        summary: {
            totalNegative: { amount: 0, currency: "EUR", precision: 2 },
            totalPositive: { amount: 0, currency: "EUR", precision: 2 },
            total: { amount: 0, currency: "EUR", precision: 2 },
        }
    }),
    getters: {
        debtors: (state) => {
            const debtors = state.allDebtors.filter((u) => {
                return (u.fine.balances[0].firstName
                + " "
                + u.fine.balances[0].lastName)
                .toLowerCase()
                    .includes(state.filter.name.toLowerCase());
            });
            switch (state.sort.field) {
                case SortField.NAME: {
                    debtors.sort((a, b) => {
                        const aFullName = (
                            a.fine.balances[0].firstName + " " + a.fine.balances[0].lastName
                        ).toLowerCase();
                        const bFullName = (
                            b.fine.balances[0].firstName + " " + b.fine.balances[0].lastName
                        ).toLowerCase();

                        return ((aFullName > bFullName)
                                ? 1 : -1)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.FINE: {
                    debtors.sort((a, b) => {
                        return ((a.fine.balances[0].fine?.amount || 0) - (b.fine.balances[0].fine?.amount || 0))
                            * (state.sort.direction || 1);
                    });
                    break;
                }
                case SortField.FINE_SINCE: {
                    debtors.sort((a, b) => {
                        const dateA = a.fine.balances[0].fineSince
                            ? new Date(a.fine.balances[0].fineSince)
                            : new Date();
                        const dateB = b.fine.balances[0].fineSince
                            ? new Date(b.fine.balances[0].fineSince)
                            : new Date();
                        return (dateA.getTime() - dateB.getTime()) * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.PRIMARY_BALANCE: {
                    debtors.sort((a, b) => {
                        return (a.fine.balances[0].amount.amount - b.fine.balances[0].amount.amount)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
                case SortField.SECONDARY_BALANCE: {
                    debtors.sort((a, b) => {
                        return (a.fine.balances[1].amount.amount - b.fine.balances[1].amount.amount)
                            * (state.sort.direction || 1)*-1;
                    });
                    break;
                }
            }

            return debtors;
        }
    },
    actions: {
        /**
         * Calculates and populates the user state
         *
         * @param primaryDate The first date for fine calculation
         * @param secondaryDate The second date for fine calculation (usually today)
         */
        async fetchCalculatedFines(primaryDate: Date, secondaryDate?: Date) {
            this.isDebtorsLoading = true;
            const dates = [primaryDate.toISOString()];
            if (secondaryDate) {
                dates.push(secondaryDate.toISOString());
            }

            // Don't calculate fines for ORGAN, VOUCHER, LOCAL_ADMIN, INVOICE, AUTOMATIC_INVOICE
            this.userToFineResponse = (await ApiService.debtor.calculateFines(dates, [
                "MEMBER",
                "LOCAL_USER",
            ])).data;

            await this.fetchDebtors();
            this.isDebtorsLoading = false;
        },
        /**
         * Fetches the user responses associated with all the UserToFineResponses
         * Useful for retrieving the GEWIS id
         */
        async fetchDebtors() {
            const users = await Promise.all(
                this.userToFineResponse.map((user) => {
                    return ApiService.user.getIndividualUser(user.id);
                }),
            );

            const allDebtors = [];

            for (const i in users) {
                allDebtors.push({
                    user: users[i].data,
                    fine: this.userToFineResponse[i]
                });
            }

            this.allDebtors = allDebtors;
        },
        /**
         * Fetch the financial summary of SudoSOS
         */
        async fetchFinancialSummary() {
            if (this.summary.totalPositive.amount != 0) return;

            // @ts-ignore
            const allBalances = await fetchAllPages<BalanceResponse>(async (take, skip) => {
                return  ApiService.balance.getAllBalance(
                    undefined,undefined,undefined,undefined,undefined,
                    // @ts-ignore
                    undefined,[ "MEMBER", "LOCAL_USER" ],undefined,undefined, undefined,
                    take, skip
                );
            });

            let totalNegative = Dinero({
               amount: 0,
               currency: "EUR",
               precision: 2
            });
            let totalPositive = Dinero({
                amount: 0,
                currency: "EUR",
                precision: 2
            });

            for (const balance of allBalances) {
                if (balance.amount.amount <= 0) {
                    totalNegative = totalNegative.add(
                        Dinero(balance.amount as Dinero.Options)
                    );
                } else {
                    totalPositive = totalPositive.add(
                        Dinero(balance.amount as Dinero.Options)
                    );
                }
            }
            this.summary.totalNegative = totalNegative.toObject();
            this.summary.totalPositive = totalPositive.toObject();
            this.summary.total =  totalNegative.add(totalPositive).toObject();
        },
        async fetchFineHandoutEvents(take: number, skip: number) {

        }
    }
});