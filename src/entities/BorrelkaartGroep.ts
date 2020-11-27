import { User } from '@/entities/User';

export interface BorrelkaartGroep {
  id: number;
  name: string;
  activeStartDate: Date;
  activeEndDate: Date;
  borrelkaarten: User[];

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
