import { Dinero } from 'dinero.js';
import { BaseEntity } from '@/entities/BaseEntity';
import { NFCDevice } from '@/entities/NFCDevice';
import { Balance } from '@/entities/Balance';

export enum TermsOfServiceStatus {
  ACCEPTED = 'ACCEPTED',
  NOT_ACCEPTED = 'NOT_ACCEPTED',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum UserType {
  MEMBER = 'MEMBER',
  ORGAN = 'ORGAN',
  BORRELKAART = 'BORRELKAART',
  LOCAL_USER = 'LOCAL_USER',
  LOCAL_ADMIN = 'LOCAL_ADMIN',
  INVOICE = 'INVOICE',
  AUTOMATIC_INVOICE = 'AUTOMATIC_INVOICE',
}

export const LOCAL_USER_TYPES = [
  UserType.LOCAL_USER, UserType.LOCAL_ADMIN, UserType.INVOICE, UserType.AUTOMATIC_INVOICE,
];

export interface UserPermissions {
  EDIT_OWN_POS_ENTITIES: boolean;
  EDIT_ALL_POS_ENTITIES: boolean;
  ACCEPT_POS_ENTITY_UPDATES: boolean;
  READ_FINANCIAL_DATA: boolean;
  EDIT_FINANCIAL_DATA: boolean;
}

export interface BaseUser extends BaseEntity {
  firstname: string;
  lastname: string;
  name: string;
  deleted: boolean;
}

export interface User extends BaseUser {
  gewisID?: number;
  email?: string;
  active: boolean;
  type: UserType;
  balance?: Balance;
  ean?: string;
  acceptedToS: TermsOfServiceStatus;
  extensiveDataProcessing: boolean;
  nfcDevices: NFCDevice[];
}

export function checkPermissions(permissions: UserPermissions, type: string) {
  if (type === 'container') {
    return permissions.EDIT_ALL_POS_ENTITIES || permissions.EDIT_OWN_POS_ENTITIES;
  }

  return false;
}
