import { SocialDrinkCard } from '@/entities/SocialDrinkCard';
import { User } from '@/entities/User';
import { SocialDrinkCardGroup } from '@/entities/SocialDrinkCardGroup';

export default class Socialdrinkcards {
  cardOwner = {
    id: '000',
    firstName: 'Ruben',
    lastName: 'Brinkman',
    saldo: 3838,
    organs: [],
  } as User;

  card1 = {
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

  card2 = {
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

  card3 = {
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
  } as SocialDrinkCard;

  card4 = {
    card: {
      id: '004',
      firstName: 'Borrel',
      lastName: 'Kaart',
      saldo: 700,
      organs: [],
    },
    barcode: '34343434343',
    initialValue: 700,
    activated: true,
  } as SocialDrinkCard;

  cardGroup = {
    owner: this.cardOwner,
    name: 'FYC Drinks 01',
    socialDrinkCards: [this.card1, this.card2, this.card3, this.card4],
    validFrom: new Date(2019, 1, 1),
    validTill: new Date(2020, 12, 31),
  } as SocialDrinkCardGroup;

  cardGroup2 = {
    owner: this.cardOwner,
    name: 'Birthday Cards',
    socialDrinkCards: [this.card1, this.card3],
    validFrom: null,
    validTill: null,
  } as SocialDrinkCardGroup;

  cardGroup3 = {
    owner: this.cardOwner,
    name: 'Contest prize',
    socialDrinkCards: [this.card4],
    validFrom: null,
    validTill: null,
  } as SocialDrinkCardGroup;

  public getCard(num?: number) {
    const cards = [this.card1, this.card2, this.card3, this.card4];

    if (num !== undefined) {
      return cards[num];
    }

    return cards;
  }

  public getGroup(num?: number) {
    const groups = [this.cardGroup, this.cardGroup2, this.cardGroup3];

    if (num !== undefined) {
      return groups[num];
    }

    return groups;
  }
}
