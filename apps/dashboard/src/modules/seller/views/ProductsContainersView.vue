<template>
  <PageContainer>
    <div class="flex flex-col gap-5">
      <ContainersCard
        v-if="containers"
        class="w-full"
        :containers="containers"
        :header="t('modules.seller.productContainers.containers.header')"
        :show-create="true"
      />
      <ProductsCard />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import ContainersCard from '@/components/container/ContainersCard.vue';
import { type ContainerInStore, useContainerStore } from '@/stores/container.store';
import ProductsCard from '@/modules/seller/components/ProductsCard.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const containerStore = useContainerStore();

const containers = computed<ContainerInStore[]>(() => Object.values(containerStore.getAllContainers));

onBeforeMount(async () => {
  await containerStore.fetchAllIfEmpty();
});
</script>

<style scoped lang="scss"></style>
