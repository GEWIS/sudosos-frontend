import { defineStore } from 'pinia';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connected: false,
    messages: [],
    maintenanceMode: false,
  }),
  actions: {
    setConnected(status: boolean) {
      this.connected = status;
    },
    addMessage(message: string) {
      this.messages.push(message);
    },
    setMaintenanceMode(enabled: boolean) {
      this.maintenanceMode = enabled;
    },
  },
});
