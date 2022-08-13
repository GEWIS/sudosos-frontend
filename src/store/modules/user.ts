import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { BaseUser, User, UserPermissions } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';
import { NFCDevice } from '@/entities/NFCDevice';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import Dinero, { DineroObject } from 'dinero.js';
import { LoginResponse } from '@/entities/APIResponses';

interface UpdateUserInfo {
  userID: number,
  firstname: string,
  lastname: string,
  email: string,
}

export interface CreateUserRequest {
  firstName: string,
  lastName: string,
  active: boolean,
  type: number,
  email: string
}

@Module({
  dynamic: true, namespaced: true, store, name: 'UserModule',
})
export default class UserModule extends VuexModule {
  // Stores info about all other users.
  users = new Map<number, User>();

  // Token user.
  self: User = {} as User;

  types = {
    SELLER: 'Seller',
    BOARD: 'SudoSOS - Board',
    BAC: 'SudoSOS - BAC',
    LOCAL: 'LOCAL_USER',
  };

  userRoles: string[] = [];

  // Organs the user is in.
  organs: User[] = [];

  // Used for dropdowns
  organsList: {value: number, text: string}[] = [];

  @Mutation
  extractResponse(response: LoginResponse) {
    this.self = UserTransformer.makeUser(response.user) as User;
    this.userRoles = response.roles;
    this.organs = response.organs.map((organ: any) => UserTransformer.makeUser(organ) as User);
    this.organsList = this.organs.map((user: User) => ({ value: user.id, text: user.firstname }));
  }

  async hasRole(role: string) {
    return this.userRoles.indexOf(role) !== -1;
  }

  @Mutation
  reset() {
    this.self = {} as User;
    this.userRoles = [];
    this.organs = [];
    this.organsList = [];
  }

  @Mutation
  setSelf(user: User) {
    this.self = user;
  }

  @Mutation
  setUserRoles(roles: string[]) {
    console.error(roles);
    this.userRoles = roles;
  }

  @Mutation
  updateSaldo(newSaldo: { amount: DineroObject }) {
    this.self.saldo = Dinero({ ...newSaldo.amount });
  }

  @Mutation
  addNFCDevice(data: {}) {
    const nfcResponse = APIHelper.postResource('user/nfcdevice', data);
    this.self.nfcDevices.splice(0, 0, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  updateNFCDevice(data: {id : number}) {
    const nfcResponse = APIHelper.putResource('user/nfcdevice', data);
    const index = this.self.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.self.nfcDevices.splice(index, 1, UserTransformer.makeNFCDevice(nfcResponse));
  }

  @Mutation
  removeNFCDevice(data: {id: number}) {
    const nfcResponse = APIHelper.delResource('user/nfcdevice');
    const index = this.self.nfcDevices.findIndex((nfc: NFCDevice) => nfc.id === data.id);
    this.self.nfcDevices.splice(index, 1);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchBalance(force: boolean = false) {
    if (this.self.saldo === undefined || force) {
      APIHelper.getResource('balances').then((saldoResponse) => {
        this.context.commit('updateSaldo', saldoResponse);
      });
    }
  }

  @Action
  async updatePinCode(pin: string) {
    const result = await APIHelper.putResource(`users/${this.self.id}/authenticator/pin`, { pin });
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUsersPinCode(update: { userID: number, pin: string }) {
    const result = await APIHelper.putResource(`users/${update.userID}/authenticator/pin`, { pin: update.pin });
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
  async fetchAllUsers() {
    await APIHelper.readPagination('users', 500).then((userResponses: any[]) => {
      const users = userResponses.map((u) => UserTransformer.makeUser(u));
      this.context.commit('setUser', users);
    });
  }

  @Mutation
  setUser(user: User) {
    this.users.set(user.id, user);
  }

  @Mutation
  setUsers(users: User[]) {
    users.forEach((user) => {
      this.users.set(user.id, user);
    });
  }

  @Action
  async createUser(userRequest: CreateUserRequest): Promise<User | BaseUser> {
    return Promise.resolve(APIHelper.postResource('users', userRequest).then((userResponse) => {
      const user = UserTransformer.makeUser(userResponse);
      this.context.commit('setUser', user);
      return user;
    }));
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchUser(force: boolean = false) {
    if (this.self.id === undefined || force) {
      const token = jwtDecode(APIHelper.getToken().jwtToken as string) as any;
      this.extractResponse(token);

      await APIHelper.getResource(`users/${token.user.id}`).then((userResponse) => {
        this.context.commit('setSelf', UserTransformer.makeUser(userResponse));
      });
      await APIHelper.getResource('balances').then((saldoResponse) => {
        this.context.commit('updateSaldo', saldoResponse);
      });
    }
  }
}
