import { Storage } from '@/entities/Storage';

export interface PointOfSale {
    name: String;
    id: String;
    ownerId: String;
    status: POSStatus;
    storages: Storage[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export enum POSStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
