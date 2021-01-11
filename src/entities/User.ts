import { Dinero } from 'dinero.js';
import { BaseEntity } from '@/entities/BaseEntity';

export interface BaseUser extends BaseEntity {
  name: string;
}

export interface User extends BaseUser {
  gewisID?: number;
  email?: string;
  active: boolean;
  type: UserType;
  saldo: Dinero;
}

export enum UserType {
  MEMBER = 1,
  ORGAN = 2,
  BORRELKAART = 3,
  LOCAL_USER = 4,
  LOCAL_ADMIN = 5,
}
