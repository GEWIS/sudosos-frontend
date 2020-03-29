export interface Storage {
    name: String;
    id: String;
    ownerId: String;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
