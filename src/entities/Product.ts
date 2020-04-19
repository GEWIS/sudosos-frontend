export interface Product {
    id: String;
    name: String;
    ownerId: String;
    price: Number;
    picture: String;
    traySize: Number;
    category: String;
    isAlcoholic: Boolean;
    negative: Boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
