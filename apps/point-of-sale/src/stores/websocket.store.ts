import { defineStore } from 'pinia';
import apiService from '@/services/ApiService';

const WEBSOCKET_URL = 'http://localhost:8080';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    maintenanceMode: false,
    url: WEBSOCKET_URL,
  }),
  actions: {
    async ping() {
      this.maintenanceMode = (await apiService.rootApi.ping()).data.maintenanceMode;
    },
    setMaintenance(data: boolean) {
      this.maintenanceMode = data;
    },
  },
});
