<template>
  <div
    class="flex flex-column h-12rem w-9rem border-300 border-1 border-round-sm overflow-hidden"
    @click="visible = true"
  >
      <div class="h-8rem flex justify-content-center align-items-center background-white">
        <img :src="getProductImageSrc(product)" :alt="product.name" class="p-1 h-8rem"/>
      </div>
      <p class="text-center m-2 text-base text-overflow-ellipsis font-bold">{{ product.name }}</p>
  </div>
  <ProductDialogComponent :container="container" v-model:visible="visible" :product="product"/>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import { getProductImageSrc } from "@/utils/imageUtils";
import { ref } from "vue";
import ProductDialogComponent from "@/components/ProductDialogComponent.vue";

const visible = ref(false);

defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});
</script>

<style scoped lang="scss">
.background-white {
  background-color: #fff; /* Ensuring background is white */
}
</style>
