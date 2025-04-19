<script setup lang="ts">
import Toast from 'primevue/toast';
import SplashComponent from '@/components/SplashComponent.vue';
import MaintenanceView from '@/views/MaintenanceView.vue';
</script>

<template>
  <MaintenanceView />
  <Toast />
  <RouterView />
  <SplashComponent />
</template>

<style lang="scss"></style>
