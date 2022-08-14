import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import { BaseUser, User } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';
import UserTransformer from '@/transformers/UserTransformer';
import { NFCDevice } from '@/entities/NFCDevice';
import jwtDecode from 'jwt-decode';
import { LoginResponse } from '@/entities/APIResponses';
import {
  CreateUserRequest,
  getAllUsers,
  getUser,
  getUsers,
  PaginatedUserResponse,
  patchUser,
  postUser,
  UpdateUserInfo,
  UserQueryParameters,
} from '@/api/users';
import { getSelfBalance } from '@/api/balance';
import dinero from 'dinero.js';

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
  updateSaldo(newSaldo: dinero.Dinero) {
    this.self.saldo = newSaldo;
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
      getSelfBalance().then((b) => this.context.commit('updateSaldo', b));
    }
  }

  @Action
  async updatePinCode(pin: string) {
    return APIHelper.putResource(`users/${this.self.id}/authenticator/pin`, { pin });
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
  async updateUserInformation(update: {id: number, user: Partial<UpdateUserInfo>}) {
    return Promise.resolve(patchUser(update.id, update.user).then((u) => {
      this.context.commit('setUser', u);
      return u;
    }));
  }

  @Action
  // eslint-disable-next-line class-methods-use-this
  async updateUsersUserInformation(information: any) {
    // pass
  }

  @Action
  async fetchAllUsers() {
    await getAllUsers().then((users) => {
      this.context.commit('setUsers', users);
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
    return Promise.resolve(postUser(userRequest).then((user) => {
      this.context.commit('setUser', user);
      return user;
    }));
  }

  @Action
  async fetchUser(id: number, force: boolean = false): Promise<User | BaseUser> {
    if (!this.users.has(id) || force) {
      return Promise.resolve(getUser(id).then((user) => {
        this.context.commit('setUser', user);
        return user;
      }));
    }
    return this.users.get(id);
  }

  @Action
  async fetchUsers(queryParameters: UserQueryParameters): Promise<PaginatedUserResponse> {
    return Promise.resolve(getUsers(queryParameters).then((response) => {
      this.context.commit('setUsers', response.records);
      return response;
    }));
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchSelf(force: boolean = false) {
    if (this.self.id === undefined || force) {
      const token = jwtDecode(APIHelper.getToken().jwtToken) as any;
      this.context.commit('extractResponse', token);
      getUser(token.user.id).then((u) => this.context.commit('setSelf', u));
      getSelfBalance().then((b) => this.context.commit('updateSaldo', b));
    }
  }
}
