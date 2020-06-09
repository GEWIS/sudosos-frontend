import { SocialDrinkCard } from '@/entities/SocialDrinkCard';
import { User } from '@/entities/User';

export interface SocialDrinkCardGroup {
  owner: User;
  name: String;
  socialDrinkCards: SocialDrinkCard[];
  validFrom: Date | null;
  validTill: Date | null;
}
