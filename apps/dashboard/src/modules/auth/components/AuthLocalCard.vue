<template>
  <div>
    <img alt="logo" class="block max-h-[14rem] mx-auto my-0" src="@/assets/img/bier.png" />
    <div v-if="header" class="my-6 mx-auto text-5xl text-900 w-full">
      {{ header }}
    </div>
    <Card>
      <template #content>
        <slot />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  header?: string;
}>();
</script>
