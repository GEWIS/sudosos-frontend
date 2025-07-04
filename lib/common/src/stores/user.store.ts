import { createPinia, defineStore } from 'pinia';
import {
  BalanceResponse,
  PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  UserResponse,
  RoleWithPermissionsResponse,
  GewisUserResponse,
  DineroObjectRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from '@sudosos/sudosos-client';
import { ApiService } from '../services/ApiService';
import { fetchAllPages } from '../helpers/PaginationHelper';

createPinia();

interface CurrentState {
  balance: BalanceResponse | null;
  user: UserResponse | null;
  rolesWithPermissions: RoleWithPermissionsResponse[];
  financialMutations: PaginatedFinancialMutationResponse;
  createdTransactions: PaginatedBaseTransactionResponse;
}
interface UserModuleState {
  users: Record<number, UserResponse>;
  balances: Record<number, BalanceResponse>;
  organs: UserResponse[];
  current: CurrentState;
}

export const useUserStore = defineStore('user', {
  state: (): UserModuleState => ({
    users: {} as Record<number, UserResponse>,
    balances: {} as Record<number, BalanceResponse>,
    organs: [],
    current: {
      balance: null,
      rolesWithPermissions: [],
      user: null,
      financialMutations: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1,
        },
        records: [],
      },
      createdTransactions: {
        _pagination: {
          take: -1,
          skip: -1,
          count: -1,
        },
        records: [],
      },
    },
  }),
  getters: {
    getUserById: (state: UserModuleState) => {
      return (userId: number) => state.users[userId];
    },
    getBalanceById: (state: UserModuleState) => {
      return (userId: number) => state.balances[userId];
    },
    getAllBalances: (state: UserModuleState) => {
      return () => state.balances;
    },
    getActiveUsers(): UserResponse[] {
      return Object.values(this.users).filter((user) => user.active);
    },
    getDeletedUsers(): UserResponse[] {
      return Object.values(this.users).filter((user) => user.deleted);
    },
    getCurrentUser(): CurrentState {
      return this.current;
    },
  },
  actions: {
    async fetchUsers(service: ApiService) {
      // Fetches all users if the store is empty
      if (Object.values(this.users).length == 0) {
        this.users = await fetchAllPages<UserResponse>((take, skip) => service.user.getAllUsers(take, skip));
      }
    },
    async fetchAllOrgans(apiService: ApiService) {
      if (this.organs.length != 0) return this.organs;
      return fetchAllPages<UserResponse>((take, skip) =>
        apiService.user.getAllUsersOfUserType('ORGAN', take, skip),
      ).then((organs) => {
        this.organs = organs;
        return this.organs;
      });
    },
    async fetchInvoiceAccountsWithBalance(service: ApiService) {
      await fetchAllPages<UserResponse>((take, skip) =>
        service.user.getAllUsers(take, skip, undefined, true, true, undefined, 'INVOICE'),
      ).then((users) => {
        this.addUsers(users);
        void this.fetchUserBalances(users, service);
      });
    },
    async fetchCurrentUserBalance(id: number, service: ApiService): Promise<BalanceResponse> {
      const res = await service.balance.getBalanceId(id);
      this.current.balance = res.data;
      return res.data;
    },
    async fetchUserBalances(users: UserResponse[], service: ApiService) {
      for (const user of users) {
        await this.fetchUserBalance(user.id, service);
      }
    },
    async fetchUserBalance(id: number, service: ApiService) {
      this.balances[id] = (await service.balance.getBalanceId(id)).data;
    },
    async fetchUserRolesWithPermissions(id: number, service: ApiService) {
      this.current.rolesWithPermissions = (await service.user.getUserRoles(id)).data;
    },
    async fetchUsersFinancialMutations(id: number, service: ApiService, take?: number, skip?: number) {
      this.current.financialMutations = (
        await service.user.getUsersFinancialMutations(id, undefined, undefined, take, skip)
      ).data;
    },
    async fetchUserCreatedTransactions(id: number, service: ApiService, take?: number, skip?: number) {
      const res = await service.transaction.getAllTransactions(
        undefined,
        id,
        undefined,
        undefined,
        id,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        take,
        skip,
      );
      this.current.createdTransactions = res.data;
    },
    async fetchGewisUser(id: number, service: ApiService): Promise<GewisUserResponse> {
      return service.user.getIndividualUser(id).then((res) => {
        this.current.user = res.data;
        return res.data as GewisUserResponse;
      });
    },
    async fetchUserApi(service: ApiService, id: number) {
      return await service.user.updateUserKey(id);
    },
    async waiveUserFine(id: number, amount: DineroObjectRequest, service: ApiService) {
      return service.user.waiveUserFines(id, {
        amount,
      });
    },
    setCurrentUser(user: UserResponse) {
      this.current.user = user;
    },
    setCurrentRolesWithPermissions(rolesWithPermissions: RoleWithPermissionsResponse[]) {
      this.current.rolesWithPermissions = rolesWithPermissions;
    },
    addUser(user: UserResponse) {
      this.users[user.id] = user;
    },
    addUsers(users: UserResponse[]) {
      for (const user of users) {
        this.addUser(user);
      }
    },
    clearCurrent() {
      this.current.balance = null;
      this.current.user = null;
    },
    deleteUser(id: number) {
      delete this.users[id];
    },
    async removeUser(id: number, service: ApiService) {
      await service.user.deleteUser(id);
      this.deleteUser(id);
    },
    async createUser(user: CreateUserRequest, service: ApiService): Promise<UserResponse> {
      const createdUser: UserResponse = (await service.user.createUser(user)).data;
      this.addUser(createdUser);
      return createdUser;
    },
    async updateUser(id: number, u: UpdateUserRequest, service: ApiService): Promise<UserResponse> {
      const updatedUser: UserResponse = (await service.user.updateUser(id, u)).data;
      this.addUser(updatedUser);
      return updatedUser;
    },
  },
});
