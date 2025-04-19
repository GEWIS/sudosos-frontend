// services/webSocketService.ts
import { io } from 'socket.io-client';
import { useWebSocketStore } from '../stores/websocket.store';

const BASE_URL = `https://sudosos.test.gewis.nl/ws/`;
const socket = io('https://sudosos.test.gewis.nl', {
  path: '/ws/socket.io',
  transports: ['websocket'], // optional: skip polling fallback
});

export const setupWebSocket = () => {
  const websocketStore = useWebSocketStore();
  socket.emit('subscribe', 'system');

  // When connected
  socket.on('connect', () => {
    websocketStore.setConnected(true);
    console.log('WebSocket connected');
  });

  // When disconnected
  socket.on('disconnect', () => {
    websocketStore.setConnected(false);
    console.log('WebSocket disconnected');
  });

  // When a new message is received
  socket.on('message', (message: string) => {
    websocketStore.addMessage(message);
  });

  // When maintenance mode changes
  socket.on('maintenance-mode', (enabled: boolean) => {
    websocketStore.setMaintenanceMode(enabled);
  });

  // Handle other events as necessary

  // Cleanup when disconnecting
  socket.on('disconnect', () => {
    // Optionally do cleanup
    socket.close();
  });
};
