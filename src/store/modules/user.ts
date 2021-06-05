import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import Dinero from 'dinero.js';
import store from '@/store';
import { User, UserPermissions } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';
import { NFCDevice } from '@/entities/NFCDevice';

@Module({
  dynamic: true, namespaced: true, store, name: 'UserModule',
})
export default class UserModule extends VuexModule {
  user: User = {} as User;

  allUsers: User[] = [];

  permissions: UserPermissions = {} as UserPermissions;

  @Mutation
  setUser(user: User) {
    this.user = user;
  }

  @Mutation
  setAllUsers(allUsers: User[]) {
    this.allUsers = allUsers;
  }

  @Mutation
  updateSaldo(newSaldo: number) {
    this.user.saldo = Dinero({ amount: newSaldo, currency: 'EUR' });
  }

  @Mutation
  updatePinCode(data: {}) {
    APIHelper.putResource('user/pincode', data);
    this.fetchUser(true);
  }

  @Mutation
  addNFCDevice(data: {}) {
    const nfcResponse = APIHelper.postResource('user/nfcdevice', data);
    this.user.nfcDevices.splice(0, 0, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  updateNFCDevice(data: {id : number}) {
    const nfcResponse = APIHelper.putResource('user/nfcdevice', data);
    const index = this.user.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.user.nfcDevices.splice(index, 1, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  removeNFCDevice(data: {id: number}) {
    const nfcResponse = APIHelper.delResource('user/nfcdevice', data);
    const index = this.user.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.user.nfcDevices.splice(index, 1);
  }

  @Mutation
  updateUserInformation(data: {
    id: number,
    firstname: string,
    lastname: string,
    email: string,
    }) {
    const userResponse = APIHelper.putResource('user/updateUserInfo', data);
    this.user.firstname = data.firstname;
    this.user.lastname = data.lastname;
    this.user.email = data.email;
  }

  @Mutation
  // eslint-disable-next-line class-methods-use-this
  updatePassword(data: {id: number, password: string}) {
    const passwordResponse = APIHelper.putResource('user/password', data);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchUser(force: boolean = false) {
    if (this.user.id === undefined || force) {
      const userResponse = APIHelper.getResource('user') as {};
      this.context.commit('setUser', UserTransformer.makeUser(userResponse));
      const saldoResponse = APIHelper.getResource('saldo') as { saldo: number };
      this.context.commit('updateSaldo', saldoResponse.saldo);
    }
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchAllUsers(force: boolean = false) {
    if (this.allUsers.length === 0 || force) {
      const userResponse = APIHelper.getResource('users') as [];
      const allUsers = userResponse.map((user) => UserTransformer.makeUser(user));
      this.context.commit('setAllUsers', allUsers);
    }
  }
}
