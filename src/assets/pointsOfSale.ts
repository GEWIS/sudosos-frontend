import { Product } from '@/entities/Product';
import { Storage } from '@/entities/Storage';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';

export default class PointsOfSale {
  public static getPointOfSale(): PointOfSale {
    return {
      name: 'SudoSOS-tablet',
      id: '1',
      ownerId: '1',
      status: POSStatus.ACCEPTED,
      storages: this.getAvailableContainers(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public static getAvailableContainers(): Storage[] {
    return [
      {
        name: 'BAC-koelkast',
        id: '1',
        ownerId: '1',
        products: [{
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
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Athena-cocktails',
        id: '2',
        ownerId: '2',
        products: [{
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
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  public static getAvailableOrgans(): Object {
    return [
      {
        value: '1',
        text: 'Fictieve sjaarzencommissie',
        members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'],
      },
      {
        value: '2',
        text: 'Niet-fictieve sjaarzencommissie',
        members: ['Sjaars 3', 'Sjaars -0', 'Sjaars 8', 'Marcin van de Ven'],
      },
      {
        value: '3',
        text: 'Fictieve niet-sjaarzencommissie',
        members: ['Sjaars 2', 'Sjaars -10', 'Sjaars 88', 'Marcin van de Ven'],
      },
      {
        value: '4',
        text: 'Niet-fictieve niet-sjaarzencommissie',
        members: ['Sjaars 69', 'Sjaars -7', 'Sjaars 42', 'Marcin van de Ven'],
      },
    ];
  }

  static getOwnerData() : Object {
    return {
      organName: 'Fictieve sjaarzencommissie',
      members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'],
    };
  }


  private beugel: Product = {
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
  };

  private tripel: Product = {
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
  };

  private alcoholFree: Product = {
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
  };

  private cocktail: Product = {
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
  };

  private bacFridge: Storage = {
    name: 'BAC-koelkast',
    id: '1',
    ownerId: '1',
    products: [this.beugel, this.tripel],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private outdoorCocktails: Storage = {
    name: 'Athena-cocktails',
    id: '2',
    ownerId: '2',
    products: [this.alcoholFree, this.cocktail],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private availableOrgans: Object = [
    {
      value: '1',
      text: 'Fictieve sjaarzencommissie',
      members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'],
    },
    {
      value: '2',
      text: 'Niet-fictieve sjaarzencommissie',
      members: ['Sjaars 3', 'Sjaars -0', 'Sjaars 8', 'Marcin van de Ven'],
    },
    {
      value: '3',
      text: 'Fictieve niet-sjaarzencommissie',
      members: ['Sjaars 2', 'Sjaars -10', 'Sjaars 88', 'Marcin van de Ven'],
    },
    {
      value: '4',
      text: 'Niet-fictieve niet-sjaarzencommissie',
      members: ['Sjaars 69', 'Sjaars -7', 'Sjaars 42', 'Marcin van de Ven'],
    },
  ];
}
