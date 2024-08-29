<template>
  <CardComponent
      :header="$t('userSettings.userSettings')"
      :func="undefined"
      :action="undefined"
      class="w-2"
      >
    <div class="flex flex-column">
      <h4>{{ $t('userSettings.changeCredentials') }}</h4>
      <div class="flex flex-row gap-2">
        <p>{{ $t('userSettings.changePin') }}</p>
        <i class="pi pi-arrow-right"></i>
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import type { UserResponse } from "@sudosos/sudosos-client";
import type { PropType } from "vue";
import CardComponent from "@/components/CardComponent.vue";

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true
  }
});
</script>

<style scoped>

</style>
