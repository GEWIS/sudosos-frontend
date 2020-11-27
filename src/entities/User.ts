export interface User {
  id: number;
  gewisID: number;
  name: string;
  active: boolean;
  type: UserType;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export enum UserType {
  MEMBER = 'MEMBER',
  ORGAN = 'ORGAN',
  BORRELKAART = 'BORRELKAART',
  LOCALUSER = 'LOCALUSER',
  LOCALADMIN = 'LOCALADMIN',
}
