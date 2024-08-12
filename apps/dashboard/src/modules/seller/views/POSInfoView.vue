<template>
  <div class="page-container flex flex-column gap-5">
    <POSSettingsCard :pos-id="id" />
    <ContainerCard
      class="container-card"
      v-if="pos && pos.containers"
      :containers="posContainers"
      show-create
    />
    <CardComponent :header="$t('transactions.recentTransactions')">
      <MutationPOSCard
        class="pos-transactions"
        :get-mutations="getPOSTransactions"
        paginator
        style="width: 100% !important"
      />
    </CardComponent>
  </div>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePointOfSaleStore } from '@/stores/pos.store';
import type {
  PaginatedBaseTransactionResponse,
  PointOfSaleWithContainersResponse
} from '@sudosos/sudosos-client';
import ContainerCard from '@/components/container/ContainerCard.vue';
import router from '@/router';
import apiService from '@/services/ApiService';
import { useContainerStore } from "@/stores/container.store";
import MutationPOSCard from "@/components/mutations/MutationsPOS.vue";
import CardComponent from "@/components/CardComponent.vue";
import POSSettingsCard from "@/modules/seller/components/POSSettingsCard.vue";

const route = useRoute(); // Use the useRoute function to access the current route
const id = ref();
const pointOfSaleStore = usePointOfSaleStore();
const pos: Ref<PointOfSaleWithContainersResponse | null | undefined> = ref();

const containerStore = useContainerStore();
const posContainerIds = computed(() => pos.value?.containers.map((container) => container.id));
const posContainers = computed(() => Object.values(containerStore.getAllContainers)
    .filter((container) => posContainerIds.value?.includes(container.id)));

onBeforeMount(async () => {
  id.value = route.params.id;
  await containerStore.fetchAllIfEmpty();
  pos.value = await pointOfSaleStore.fetchPointOfSaleWithContainers(id.value);
  if (!pos.value) {
    await router.replace('/error');
    return;
  }
});

const getPOSTransactions = async (
  take: number,
  skip: number
): Promise<PaginatedBaseTransactionResponse | undefined> => {
  return await apiService.pos.getTransactions(id.value, take, skip).then((res) => res.data);
};

</script>

<style scoped lang="scss">
</style>
