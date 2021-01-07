import { BaseEntity } from '@/entities/BaseEntity';

export interface User extends BaseEntity {
  id: number;
  gewisID: number;
  name: string;
  active: boolean;
  type: UserType;
  saldo: number;
}

export enum UserType {
  MEMBER = 'MEMBER',
  ORGAN = 'ORGAN',
  BORRELKAART = 'BORRELKAART',
  LOCALUSER = 'LOCALUSER',
  LOCALADMIN = 'LOCALADMIN',
}
