import { Product } from '@/entities/Product';

export interface Storage {
    name: String;
    id: String;
    ownerId: String;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
