import { defineStore } from 'pinia';

type LogEntry = { time: Date; message: string };

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connected: false,
    messages: [] as string[],
    maintenanceMode: false,
    disconnected: false,
    logs: [] as LogEntry[],
    socket: null as WebSocket | null,
  }),
  actions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSocket(socket: any) {
      this.socket = socket;
    },
    setConnected(status: boolean) {
      this.connected = status;
      this.disconnected = !status;
    },
    addMessage(message: string) {
      this.messages.push(message);
    },
    setMaintenanceMode(enabled: boolean) {
      this.maintenanceMode = enabled;
    },
    addLog(log: LogEntry) {
      this.logs.push(log);
    },
  },
});
