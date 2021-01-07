import { User } from '@/entities/User';
import { Container } from '@/entities/Container';
import { BaseEntity } from '@/entities/BaseEntity';


export interface PointOfSale extends BaseEntity {
  id: number;
  version: number;
  name: string;
  owner: User;
  startDate: Date;
  endDate: Date;
  containerIds: Container['id'][];
  approved: boolean;
  useAuthentication: boolean;
}
