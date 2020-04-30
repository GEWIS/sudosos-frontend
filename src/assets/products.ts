import { Product } from '@/entities/Product';

export default class FakeProducts {
  public static fetchProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Grolsch beugel',
        ownerId: '1',
        price: 110,
        picture: 'https://www.supermarktaanbiedingen.com/public/images/product/2017/39/0-508102fls-grolsch-premium-pilsner-beugel-45cl.jpg',
        traySize: 20,
        category: 'drink',
        isAlcoholic: true,
        negative: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Grimbergen tripel (voor de sfeer)',
        ownerId: '1',
        price: 90,
        picture: 'https://deklokdranken.blob.core.windows.net/product-images/105120.jpg',
        traySize: 24,
        category: 'drink',
        isAlcoholic: true,
        negative: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Alcoholvrije Athena-meuk',
        ownerId: '2',
        price: 50,
        picture: 'https://www.cocktailicious.nl/wp-content/uploads/2019/10/sex-on-the-beach.jpg',
        traySize: 1,
        category: 'drink',
        isAlcoholic: false,
        negative: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Athena-meuk met alcohol',
        ownerId: '2',
        price: 150,
        picture: 'https://www.mitra.nl/cms/userfiles/cocktails/298-mojito43.png',
        traySize: 1,
        category: 'drink',
        isAlcoholic: true,
        negative: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}
