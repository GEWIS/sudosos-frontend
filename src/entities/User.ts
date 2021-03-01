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
  saldo?: Dinero;
  ean?: string;
}

export enum UserType {
  MEMBER = 1,
  ORGAN = 2,
  BORRELKAART = 3,
  LOCAL_USER = 4,
  LOCAL_ADMIN = 5,
}

export interface UserPermissions {
  EDIT_OWN_POS_ENTITIES: boolean;
  EDIT_ALL_POS_ENTITIES: boolean;
  ACCEPT_POS_ENTITY_UPDATES: boolean;
  READ_FINANCIAL_DATA: boolean;
  EDIT_FINANCIAL_DATA: boolean;
}
