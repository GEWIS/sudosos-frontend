import { SocialDrinkCard } from '@/entities/SocialDrinkCard';
import { User } from '@/entities/User';

export interface SocialDrinkCardGroup {
  owner: User;
  name: String;
  socialDrinkCards: SocialDrinkCard[];
  amount?: Number;
  amountActive?: Number;
  validDates: {
    validTill: Date,
    validFrom: Date,
  } | null;
  showDetails?: boolean;
}
