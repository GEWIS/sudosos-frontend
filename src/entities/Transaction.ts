export interface Transaction {
    id: String;
    soldToId: String;
    authorized: String;
    totalPrice: Number;
    activityId: String;
    comment: String;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
