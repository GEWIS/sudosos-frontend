<script setup lang="ts">
import Toast from 'primevue/toast';
import SplashComponent from '@/components/SplashComponent.vue';
</script>

<template>
  <Toast />
  <RouterView />
  <SplashComponent />
</template>

<style lang="scss">
.image-underlay {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  pointer-events: none;
  z-index: -10;
  overflow: hidden;

  position: fixed;
  top: -25%;
  right: 0;
  height: 175%;
}
</style>
