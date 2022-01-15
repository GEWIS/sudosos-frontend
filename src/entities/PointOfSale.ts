import { BaseUser, User } from '@/entities/User';
import { BaseContainer, Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';
import { ProductOrder } from '@/entities/ProductOrder';

export interface BasePointOfSale extends BaseEntity {
  name: string;
  owner: BaseUser | User;
  startDate: Date;
  endDate: Date;
  useAuthentication: boolean;
}

export interface PointOfSale extends BasePointOfSale {
  revision?: number;
  containers: BaseContainer[] | Container[];
  productOrder?: ProductOrder[];
}
