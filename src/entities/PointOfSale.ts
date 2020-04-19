import { Storage } from '@/entities/Storage';

export interface PointOfSale {
    name: String;
    id: String;
    ownerId: String;
    storages: Storage[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
