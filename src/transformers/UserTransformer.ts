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
        name: data.name,
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
      name: data.name,
      gewisID: data.gewisID,
      email: data.email,
      active: data.active,
      type: data.type,
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
};
