import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { User, UserPermissions } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';
import { NFCDevice } from '@/entities/NFCDevice';
import jwtDecode from 'jwt-decode';
import Dinero from 'dinero.js';

interface UpdateUserInfo {
  userID: number,
  firstname: string,
  lastname: string,
  email: string,
}

@Module({
  dynamic: true, namespaced: true, store, name: 'UserModule',
})
export default class UserModule extends VuexModule {
  user: User = {} as User;

  types = {
    SELLER: 'Seller',
    BOARD: 'SudoSOS - Board',
    BAC: 'SudoSOS - BAC',
    LOCAL: 'LOCAL_USER',
  };

  memberships: User[] = [];

  userRoles: string[] = [];

  allUsers: User[] = [];

  permissions: UserPermissions = {} as UserPermissions;

  @Action
  async hasRole(role: string) {
    return this.userRoles.indexOf(role) !== -1;
  }

  @Mutation
  reset() {
    this.user = {} as User;
    this.userRoles = [];
    this.memberships = [];
    this.permissions = {} as UserPermissions;
  }

  @Mutation
  setUser(user: User) {
    this.user = user;
  }

  @Mutation
  setMemberships(users: User[]) {
    this.memberships = users;
  }

  @Mutation
  clearMemberships() {
    this.memberships = [];
  }

  @Mutation
  setUserRoles(roles: string[]) {
    console.error(roles);
    this.userRoles = roles;
  }

  @Mutation
  updateSaldo(newSaldo: number) {
    this.user.saldo = Dinero({ amount: newSaldo, currency: 'EUR' });
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
    const nfcResponse = APIHelper.delResource('user/nfcdevice');
    const index = this.user.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.user.nfcDevices.splice(index, 1);
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

  @Action
  async updatePinCode(pin: string) {
    const result = await APIHelper.putResource(`users/${this.user.id}/pin`, { pin });
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUsersPinCode(update: { userID: number, pin: string }) {
    const result = await APIHelper.putResource(`users/${update.userID}/pin`, { pin: update.pin });
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updatePassword(password: { id: number, password: string }) {
    // pass
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUsersPassword(password: { userID: number, password: string }) {
    // pass
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUserInformation(information: UpdateUserInfo) {
    // pass
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUsersUserInformation(information: any) {
    // pass
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async fetchAllUsers() {
    // pass
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
  fetchMemberships(force: boolean = false) {
    if (this.memberships.length === 0 || force) {
      const token = jwtDecode(APIHelper.getToken().jwtToken as string) as any;

      APIHelper.getResource(`users/${token.user.id}/authenticate`).then((userResponses: any[]) => {
        const users = userResponses.map((cntr) => UserTransformer.makeUser(cntr));
        this.context.commit('setMemberships', users);
      });
    }
  }
}
