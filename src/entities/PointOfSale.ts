import { User } from '@/entities/User';
import { Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';
import { ProductOrder } from '@/entities/ProductOrder';

export interface BasePointOfSale extends BaseEntity {
  name: string;
}

export interface PointOfSale extends BasePointOfSale {
  revision: number;
  owner: User;
  startDate: Date;
  endDate: Date;
  containers: Container[];
  productOrder?: ProductOrder[];
  useAuthentication: boolean;
}
