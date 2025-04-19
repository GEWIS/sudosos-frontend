import type {
  PaginatedWriteOffResponse,
  WriteOffResponse,
  WriteOffRequest,
  BalanceResponse,
} from '@sudosos/sudosos-client';
import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

export const useWriteOffStore = defineStore('writeoff', {
  state: () => ({
    writeOffs: {} as Record<number, WriteOffResponse>,
    updatedAt: 0,
    inactiveUsers: [] as BalanceResponse[],
    count: 0,
  }),
  getters: {
    getWriteOff:
      (state) =>
      (id: number): WriteOffResponse | null => {
        return state.writeOffs[id] || null;
      },
    getUpdatedAt(): number {
      return this.updatedAt;
    },
    getAllWriteOffs(): Record<number, WriteOffResponse> {
      return this.writeOffs;
    },
  },
  actions: {
    async fetchWriteOffs(take: number, skip: number): Promise<PaginatedWriteOffResponse> {
      return apiService.writeOffs.getAllWriteOffs(undefined, undefined, take, skip).then((res) => {
        res.data.records.forEach((writeOff: WriteOffResponse) => {
          this.writeOffs[writeOff.id] = writeOff;
        });
        return res.data;
      });
    },
    async fetchWriteOff(id: number): Promise<WriteOffResponse> {
      return apiService.writeOffs.getSingleWriteOff(id).then((res) => {
        this.writeOffs[id] = res.data;
        return res.data;
      });
    },
    async createWriteOff(values: WriteOffRequest): Promise<WriteOffResponse> {
      return apiService.writeOffs.createWriteOff(values).then((res) => {
        this.writeOffs[res.data.id] = res.data;
        this.updatedAt = Date.now();
        return res.data;
      });
    },
    async fetchInactiveUsers(take: number, skip: number, orderBy = 'amount', orderDirection = 'ASC') {
      const users = await apiService.balance.getAllBalance(
        undefined,
        undefined,
        -1,
        undefined,
        undefined,
        undefined,
        ['MEMBER', 'LOCAL_USER'],
        orderBy,
        orderDirection,
        true,
        true,
        take,
        skip,
      );
      this.inactiveUsers = users.data.records;
      this.count = users.data._pagination.count;
      return this.inactiveUsers;
    },
  },
});
