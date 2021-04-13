import { BaseUser, User } from '@/entities/User';
import { Product } from '@/entities/Product';
import { BaseEntity } from '@/entities/BaseEntity';

export interface BaseContainer extends BaseEntity {
  name: string;
}

export interface Container extends BaseContainer {
  revision?: number;
  owner: BaseUser | User;
  products: Product[];
  public?: boolean;
}
