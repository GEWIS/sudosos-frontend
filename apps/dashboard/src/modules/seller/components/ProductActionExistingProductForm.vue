<template>
  <div class="flex gap-5 justify-content-end">
    <p class="prop">{{ t('modules.seller.productContainers.products.addExisting') }}</p>
    <Dropdown
        :placeholder="t('modules.seller.forms.product.select')"
        :options="products"
        optionLabel="name"
        v-model="selectProduct"
        :filter="true"
        class="w-15rem align-items-center"
    />
  </div>
</template>

<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import type { BaseProductResponse } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const selectProduct = defineModel('selectProduct');

defineProps<{
  products: BaseProductResponse[]
}>();

</script>


<style scoped lang="scss">

</style>
