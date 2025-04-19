<template>
  <div v-if="shouldShow && !init" class="overlay">
    <div class="error">
      <div>
        <img alt="logo" class="max-h-9rem block mx-auto" src="../assets/bier_grayscale.png" />
        <div class="text-white text-1xl text-center">SudoSOS is currently unavailable</div>
        <div class="text-white text-2xl text-center">Please try again later</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useWebSocketStore } from '@/stores/websocket.store';

const webSocketStore = useWebSocketStore();

const socket = io(webSocketStore.url);

HandleWebSocket(socket);

const init = ref(true);
onMounted(() => {
  setTimeout(() => {
    init.value = false;
  }, 500);
});
const shouldShow = computed(() => {
  return webSocketStore.maintenanceMode;
});

function HandleWebSocket(ws: Socket) {
  void webSocketStore.ping();

  ws.emit('subscribe', 'maintenance');

  ws.on('maintenance-mode', (data) => {
    webSocketStore.setMaintenance(data);
  });
}
</script>

<style scoped lang="scss">
.overlay {
  background-color: white;
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error {
  background-color: darkred;
  color: white;
  font-size: 30px;
  width: 100%;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
