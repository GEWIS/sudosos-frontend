<template>
  <InputDropdownSpan
    :label="label"
    :selected-option="organ"
    :options="organs || userOrgans"
    :errors="errors"
    :disabled="disabled"
    option-label="firstName"/>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import type { UserResponse } from "@sudosos/sudosos-client";
import InputDropdownSpan from "@/components/InputDropdownSpan.vue";

const authStore = useAuthStore();

const userOrgans = computed(() => {
  return authStore.organs;
});

defineProps({
  label: {
    type: String,
    required: true
  },
  errors: {
    type: Object as PropType<any>,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  column: {
    type: Boolean,
    required: false,
    default: false
  },
  organs: {
    type: Object as PropType<UserResponse[]>,
    required: false
  }
});


const organ = defineModel<UserResponse>('organ');

</script>

<style scoped lang="scss">

</style>
