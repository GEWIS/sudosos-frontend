<script setup lang="ts">
import Toast from 'primevue/toast';
import SplashComponent from '@/components/SplashComponent.vue';
// import ConnectionLostOverlay from '@/components/ConnectionLostOverlay.vue';
import MaintenanceModeOverlay from '@/components/MaintenanceModeOverlay.vue';
</script>

<template>
  <Toast />
  <MaintenanceModeOverlay />
  <!--  TODO fix when WS works again -->
  <!--  <ConnectionLostOverlay />-->
  <RouterView />
  <SplashComponent />
</template>

<style lang="scss"></style>
