import { BaseUser, User } from '@/entities/User';
import { BaseContainer, Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';
import { ProductOrder } from '@/entities/ProductOrder';

export interface BasePointOfSale extends BaseEntity {
  name: string;
}

export interface PointOfSale extends BasePointOfSale {
  revision?: number;
  owner: BaseUser | User;
  startDate: Date;
  endDate: Date;
  containers: BaseContainer[] | Container[];
  productOrder?: ProductOrder[];
  useAuthentication: boolean;
}
