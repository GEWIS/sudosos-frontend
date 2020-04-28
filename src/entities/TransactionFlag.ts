import { Transaction } from '@/entities/Transaction';

export interface TransactionFlag {
    id: String;
    status: FlagStatus;
    flaggedById: String;
    reason: String;

    transaction: Transaction;

    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    formattedDate?: String;
}

export enum FlagStatus {
    TODO = 'TODO',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}
