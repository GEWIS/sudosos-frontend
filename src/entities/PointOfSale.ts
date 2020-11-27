import { User } from '@/entities/User';
import { Container } from '@/entities/Container';


export interface PointOfSale {
  id: number;
  version: number;
  name: string;
  owner: User;
  startDate: Date;
  endDate: Date;
  containerIds: Container['id'][];
  approved: boolean;
  useAuthentication: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
