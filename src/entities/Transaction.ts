import { SubTransaction } from '@/entities/SubTransaction';

export interface Transaction {
    id: String;
    soldToId: String;
    authorized: String;
    totalPrice: Number;
    pointOfSale: String;
    activityId: String;
    subTransactions: SubTransaction[]
    comment: String;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    formattedDate?: String;
}
