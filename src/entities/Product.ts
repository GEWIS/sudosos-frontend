import { PointOfSale } from './PointOfSale';

export interface Product {
    id: String;
    name: String;
    ownerId: String;
    price: Number;
    picture: String;
    traySize: Number;
    category: String;
    isAlcoholic: Boolean;
    pointOfSale: PointOfSale;
    negative: Boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
