<template>
  <div>
    <span
:class="['flex flex-wrap justify-content-between',
     column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Dropdown
          v-model="container"
          class="w-full md:w-15rem"
          option-label="name"
          :options="containers"
          :placeholder="placeholder"
      >
    <template #option="slotProps">
      {{ slotProps.option.name }}
    </template>
  </Dropdown>
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, type PropType } from "vue";
import ErrorSpan from "@/components/ErrorSpan.vue";
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";

const containerStore = useContainerStore();

onBeforeMount(() => {
  containerStore.fetchAllIfEmpty();
});

const containers = computed(() => {
  return Object.values(containerStore.getAllContainers);
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
});

const container = defineModel<ContainerInStore>('container');

</script>

<style scoped lang="scss">

</style>
