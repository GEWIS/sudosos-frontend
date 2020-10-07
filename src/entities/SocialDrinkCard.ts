import { User } from '@/entities/User';

export interface SocialDrinkCard {
  card: User;
  barcode: String;
  initialValue: Number;
  activated: Boolean;
}
