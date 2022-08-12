import dinero from 'dinero.js';
import { BaseUser, User } from '@/entities/User';
import BaseTransformer from '@/transformers/BaseTransformer';

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

    const { ean } = data;
    let saldo;
    let nfcDevices = [];

    if ('saldo' in data) {
      saldo = dinero({ amount: Number(data.saldo), currency: 'EUR' });
    }

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
      gewisID: data.gewisID,
      email: data.email,
      active: data.active,
      type: data.type,
      deleted: data.deleted,
      acceptedToS: data.acceptedToS,
      extensiveDataProcessing: data.extensiveDataProcessing,
      saldo,
      ean,
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

  makeSaldo(data: any) {
    return dinero({ amount: data, currency: 'EUR' });
  },
};
