import dinero from 'dinero.js';
import { BaseUser, User, UserType } from '@/entities/User';
import BaseTransformer from '@/transformers/BaseTransformer';
import { Balance } from '@/entities/Balance';

export interface BalanceResponse {
  id: number,
  amount: dinero.DineroObject,
  lastTransactionId: number,
  lastTransferId:number
  fine: dinero.DineroObject,
  fineSince: string;
}

export default {
  makeUser(data: any) : BaseUser | User {
    if (data === undefined) {
      return {} as BaseUser;
    }

    if (!Object.keys(data).includes('active')) {
      return {
        ...BaseTransformer.makeBaseEntity(data),
        firstname: data.firstName,
        lastname: data.lastName,
        name: `${data.firstName} ${data.lastName}`.trim(),
        deleted: data.deleted,
      } as BaseUser;
    }

    const { ean, balance } = data;
    let nfcDevices = [];

    if ('nfcDevices' in data) {
      nfcDevices = data.nfcDevices.map((nfcDevice: { name: any; address: any; }) => (
        this.makeNFCDevice(nfcDevice)
      ));
    }

    return {
      ...BaseTransformer.makeBaseEntity(data),
      firstname: data.firstName,
      lastname: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      gewisId: data.gewisId,
      email: data.email,
      active: data.active,
      type: UserType[data.type as UserType],
      deleted: data.deleted,
      acceptedToS: data.acceptedToS,
      extensiveDataProcessing: data.extensiveDataProcessing,
      ean,
      balance,
      nfcDevices,
    } as User;
  },

  makeNFCDevice(data: any) {
    return {
      ...BaseTransformer.makeBaseEntity(data),
      name: data.name,
      address: data.address,
    };
  },

  dineroObjectToDinero(data: dinero.DineroObject): dinero.Dinero {
    const { amount, currency, precision } = data;
    return dinero({ amount, currency, precision });
  },

  makeBalance(data: BalanceResponse): Balance {
    return {
      balance: this.dineroObjectToDinero(data.amount),
      fine: data.fine ? this.dineroObjectToDinero(data.fine) : undefined,
      fineSince: data.fineSince ? new Date(data.fineSince) : undefined,
    };
  },
};
