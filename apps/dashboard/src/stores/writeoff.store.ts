import apiService from "@/services/ApiService";
import type { PaginatedWriteOffResponse, WriteOffResponse, WriteOffRequest } from "@sudosos/sudosos-client";
import { defineStore } from "pinia";

export const useWriteOffStore = defineStore('writeoff', {
    state: () => ({
        writeOffs: {} as Record<number,any>,
        updatedAt: 0,
    }),
    getters: {
        getWriteOff: (state) => (id: number): any | null => {
            return state.writeOffs[id] || null;
        },
        getUpdatedAt(): number {
            return this.updatedAt;
        },
        getAllWriteOffs(): Record<number, any> {
            return this.writeOffs;
        }
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
    },
});