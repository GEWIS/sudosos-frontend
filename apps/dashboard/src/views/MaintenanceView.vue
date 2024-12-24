<template>
  <div class="flex flex-column h-screen bg-primary">
    <main class="flex flex-column align-items-center justify-content-center flex-grow text-center
    h-full mx-auto my-7 max-w-30rem">
      <img class="max-h-9rem block mx-auto mb-5" src="../assets/img/bier_grayscale.png" alt="logo"/>
      <div class="text-white font-bold text-3xl text-center">{{ t('modules.auth.maintenance.maintenance') }}</div>
      <div class="text-white text-2xl text-center">{{ t('modules.auth.maintenance.tryAgain') }}</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped lang="scss">

</style>