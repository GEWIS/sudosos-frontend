import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import Dinero from 'dinero.js';
import store from '@/store';
import { User, UserPermissions } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';
import { NFCDevice } from '@/entities/NFCDevice';
import jwtDecode from 'jwt-decode';

@Module({
  dynamic: true, namespaced: true, store, name: 'UserModule',
})
export default class UserModule extends VuexModule {
  user: User = {} as User;

  userRoles: string[] = [];

  allUsers: User[] = [];

  permissions: UserPermissions = {} as UserPermissions;

  @Mutation
  reset() {
    this.user = {} as User;
    this.userRoles = [];
    this.allUsers = [];
    this.permissions = {} as UserPermissions;
  }

  @Mutation
  setUser(user: User) {
    this.user = user;
  }

  @Mutation
  setAllUsers(allUsers: User[]) {
    this.allUsers = allUsers;
  }

  @Mutation
  setUserRoles(roles: string[]) {
    this.userRoles = roles;
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
  updateUsersPinCode(data: {}) {
    APIHelper.putResource('user/pincode', data);
    this.fetchAllUsers(true);
  }

  @Mutation
  addNFCDevice(data: {}) {
    const nfcResponse = APIHelper.postResource('user/nfcdevice', data);
    this.user.nfcDevices.splice(0, 0, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  addUsersNFCDevice(data: {
    userID: number;
  }) {
    const nfcResponse = APIHelper.postResource('user/nfcdevice', data);
    const index = this.allUsers.findIndex((user) => user.id === data.userID);
    const user = this.allUsers[index];

    user.nfcDevices.splice(0, 0, UserTransformer.makeNFCDevice(nfcResponse));

    this.allUsers.splice(index, 1, user);
  }

  @Mutation
  updateNFCDevice(data: {id : number}) {
    const nfcResponse = APIHelper.putResource('user/nfcdevice', data);
    const index = this.user.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.user.nfcDevices.splice(index, 1, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  updateUsersNFCDevice(data: {id : number, userID: number}) {
    const nfcResponse = APIHelper.putResource('user/nfcdevice', data);
    const userIndex = this.allUsers.findIndex((user) => user.id === data.userID);
    const user = this.allUsers[userIndex];
    const index = user.nfcDevices.findIndex(
      (nfc: NFCDevice) => nfc.id === data.id,
    );

    user.nfcDevices.splice(
      index, 1, UserTransformer.makeNFCDevice(nfcResponse),
    );

    this.allUsers.splice(userIndex, 1, user);
  }

  @Mutation
  removeNFCDevice(data: {id: number}) {
    const nfcResponse = APIHelper.delResource('user/nfcdevice', data);
    const index = this.user.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.user.nfcDevices.splice(index, 1);
  }

  @Mutation
  removeUsersNFCDevice(data: {id: number, userID: number}) {
    const nfcResponse = APIHelper.delResource('user/nfcdevice', data);
    const userIndex = this.allUsers.findIndex((user) => user.id === data.userID);
    const user = this.allUsers[userIndex];
    const index = user.nfcDevices.findIndex(
      (nfc: NFCDevice) => nfc.id === data.id,
    );

    user.nfcDevices.splice(index, 1);
    this.allUsers.splice(userIndex, 1, user);
  }

  @Mutation
  updateUserInformation(data: {
    userID: number,
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
  updateUsersUserInformation(data: {
    userID: number,
    firstname: string,
    lastname: string,
    email: string,
    active: boolean,
  }) {
    const userResponse = APIHelper.putResource('user/updateUserInfo', data);
    const userIndex = this.allUsers.findIndex((user) => user.id === data.userID);
    const user = this.allUsers[userIndex];

    user.firstname = data.firstname;
    user.lastname = data.lastname;
    user.name = `${data.firstname} ${data.lastname}`;
    user.email = data.email;
    user.active = data.active;

    this.allUsers.splice(userIndex, 1, user);
  }

  @Mutation
  // eslint-disable-next-line class-methods-use-this
  updatePassword(data: {id: number, password: string}) {
    const passwordResponse = APIHelper.putResource('user/password', data);
  }

  @Mutation
  // eslint-disable-next-line class-methods-use-this
  updateUsersPassword(data: {userID: number, password: string}) {
    const passwordResponse = APIHelper.putResource('user/password', data);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchBalance(force: boolean = false) {
    if (this.user.saldo === undefined || force) {
      APIHelper.getResource('balances').then((saldoResponse) => {
        this.context.commit('updateSaldo', saldoResponse);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchUser(force: boolean = false) {
    if (this.user.id === undefined || force) {
      const token = jwtDecode(APIHelper.getToken().jwtToken as string) as any;

      APIHelper.getResource(`users/${token.user.id}`).then((userResponse) => {
        this.context.commit('setUser', UserTransformer.makeUser(userResponse));
      });
      APIHelper.getResource('balances').then((saldoResponse) => {
        this.context.commit('updateSaldo', saldoResponse);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchAllUsers(force: boolean = false) {
    if (this.allUsers.length === 0 || force) {
      APIHelper.getResource('users').then((userResponse) => {
        const allUsers = userResponse.map((user: any) => UserTransformer.makeUser(user));
        this.context.commit('setAllUsers', allUsers);
      });
    }
  }
}
