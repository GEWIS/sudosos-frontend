import type { BaseTransactionResponse, BaseUserResponse, TransferResponse } from "@sudosos/sudosos-client";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import type { Dinero } from "@sudosos/sudosos-client";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";
import type { PaginatedBaseTransactionResponse } from "@sudosos/sudosos-client";


export enum FinancialMutationType {
    INVOICE,
    DEPOSIT,
    PAYOUT_REQUEST,
    FINE,
    WAIVED_FINE,
    TRANSACTION
}

export interface FinancialMutation {
    amount: Dinero,
    to: BaseUserResponse | undefined,
    from: BaseUserResponse | undefined,
    type: FinancialMutationType,
    moment: Date,
    id: number
}


export function formatValueEuro(value: Dinero): string {
    return formatPrice(value);
}

export function parseTransaction(transaction: BaseTransactionResponse): FinancialMutation {
    return {
        amount: transaction.value,
        to: undefined,
        from: transaction.from,
        type: FinancialMutationType.TRANSACTION,
        moment: new Date(transaction.updatedAt!!),
        id: transaction.id
    };
}

export function parseTransfer(transfer: TransferResponse): FinancialMutation {
    let type = FinancialMutationType.DEPOSIT
    
    if(transfer.invoice) {
        type = FinancialMutationType.INVOICE
    } else if(transfer.deposit) {
        type = FinancialMutationType.DEPOSIT
    } else if(transfer.payoutRequest) {
        type = FinancialMutationType.PAYOUT_REQUEST
    } else if(transfer.fine) {
        type = FinancialMutationType.FINE
    }
    
    return {
        amount: transfer.amount,
        to: transfer.to,
        from: transfer.from,
        type: type,
        moment: new Date(transfer.updatedAt!!),
        id: transfer.id
    };
}

export function parseFinancialTransactions(transactions: PaginatedBaseTransactionResponse) : FinancialMutation[] {
    const result: FinancialMutation[] = [];
    transactions.records.forEach((transaction: BaseTransactionResponse) => {
        result.push(parseTransaction(transaction));
    });
    return result;
}

export function transferDescription(transfer: TransferResponse): string {
    if (transfer.deposit) {
        return `You increased your balance with ${formatValueEuro(transfer.amount)}`;
    } else if (transfer.invoice) {
        return `An invoice valued ${formatValueEuro(transfer.amount)} was added.`;
    } else if (transfer.payoutRequest) {
        // Todo: Currently payoutRequests are not fetched. So this will actually not do anything.
        return `You were refunded ${formatValueEuro(transfer.amount)}`;
    } else if (transfer.fine) {
        return `You were fined ${formatValueEuro(transfer.amount)}`;
    } else if (transfer.description == 'Initial transfer from SuSOS') {
        return `You got ${formatValueEuro(transfer.amount)} transferred from your SuSOS account.`;
    } else {
        return `An unknown transaction was performed on your account.`; // This is probably not even possible.
    }
}

export function transactionDescription(transaction: BaseTransactionResponse): string {
    const user = useUserStore().getCurrentUser.user;
    if (user === null) return "error";
    const currentUserId: number = user.id;
    const valueOfTransaction: string = formatValueEuro(transaction.value);
    if (transaction.from.id === currentUserId) {
        if (!transaction.createdBy) {
            return `Magically, a transaction of ${valueOfTransaction} was put in.`;
        } else {
            if (transaction.createdBy.id === currentUserId) {
                return `You spent a total of ${valueOfTransaction}`;
            } else {
                return `${transaction.createdBy.firstName} charged you ${valueOfTransaction}`;
            }
        }
    } else {
        return `You charged ${transaction.from.firstName} a total of ${valueOfTransaction}`;
    }
}
