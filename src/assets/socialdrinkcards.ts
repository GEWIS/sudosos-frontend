import { SocialDrinkCard } from '@/entities/SocialDrinkCard';
import { User } from '@/entities/User';
import { SocialDrinkCardGroup } from '@/entities/SocialDrinkCardGroup';

export default class Socialdrinkcards {
  public static cardOwner = {
    id: '000',
    firstName: 'Ruben',
    lastName: 'Brinkman',
    saldo: 3838,
    organs: [],
  } as User;

  public static card1 = {
    card: {
      id: '001',
      firstName: 'Borrel',
      lastName: 'Kaart',
      saldo: 700,
      organs: [],
    },
    barcode: '04040404040',
    initialValue: 700,
    activated: true,
  } as SocialDrinkCard;

  public static card2 = {
    card: {
      id: '002',
      firstName: 'Borrel',
      lastName: 'Kaart',
      saldo: 700,
      organs: [],
    },
    barcode: '14141414141',
    initialValue: 700,
    activated: true,
  } as SocialDrinkCard;

  public static card3: SocialDrinkCard = {
    card: {
      id: '003',
      firstName: 'Borrel',
      lastName: 'Kaart',
      saldo: 700,
      organs: [],
    },
    barcode: '24242424242',
    initialValue: 700,
    activated: true,
  };

  public static card4: SocialDrinkCard = {
    card: {
      id: '004',
      firstName: 'Borrel',
      lastName: 'Kaart',
      saldo: 700,
      organs: [],
    },
    barcode: '34343434343',
    initialValue: 700,
    activated: false,
  };

  public static cardGroup = {
    owner: Socialdrinkcards.cardOwner,
    name: 'FYC Drinks 01',
    // eslint-disable-next-line max-len
    socialDrinkCards: [Socialdrinkcards.card1, Socialdrinkcards.card2, Socialdrinkcards.card3, Socialdrinkcards.card4],
    validDates: {
      validFrom: new Date(2019, 1, 1),
      validTill: new Date(2020, 12, 31),
    },
  } as SocialDrinkCardGroup;

  public static cardGroup2 = {
    owner: Socialdrinkcards.cardOwner,
    name: 'Birthday Cards',
    socialDrinkCards: [Socialdrinkcards.card1, Socialdrinkcards.card3],
    validDates: null,
  } as SocialDrinkCardGroup;

  public static cardGroup3 = {
    owner: Socialdrinkcards.cardOwner,
    name: 'Contest prize',
    socialDrinkCards: [Socialdrinkcards.card4],
    validDates: null,
  } as SocialDrinkCardGroup;

  public static getCards() {
    // eslint-disable-next-line max-len
    const cards = [Socialdrinkcards.card1, Socialdrinkcards.card2, Socialdrinkcards.card3, Socialdrinkcards.card4];

    return cards;
  }

  public static getGroups() {
    const groups = [this.cardGroup, this.cardGroup2, this.cardGroup3];

    return groups;
  }
}
