<template>
  <CardComponent :header="$t('containersOverview.Containers')" class="p-0">
    <div class="flex justify-content-end">
      <Button @click="openContainerEdit()">Create</Button>
    </div>
    <Accordion :activeIndex="0" class="block w-full" :multiple="true"
               @tab-open="(event: AccordionTabOpenEvent) => onTabOpen(event)">
      <AccordionTab v-for="container in containers" :key="container.id">
        <template #header>
          <div class="flex justify-content-between w-full">
            <span>
              {{ container.name }}
              {{ container.id }}
            </span>
            <div @click="() => openContainerEdit(container.id)" class="mx-3">
              <i class="pi pi-pencil"/>
            </div>
          </div>
        </template>
        <ProductGridComponent :container="container"/>
      </AccordionTab>
    </Accordion>
    <ContainerCreateDialog :container="selectedContainer" v-model:visible="visible"/>
  </CardComponent>

</template>
<script setup lang="ts">
import ProductGridComponent from "@/components/ProductGridComponent.vue";
import CardComponent from "./CardComponent.vue";
import Accordion, { type AccordionTabOpenEvent } from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";
import { type Ref, ref } from "vue";
import ContainerCreateDialog from "@/components/ContainerCreateDialog.vue";
import type { ContainerResponse } from "@sudosos/sudosos-client";

const visible = ref(false);
const selectedContainer: Ref<ContainerResponse | null> = ref(null);

const props = defineProps({
  containers: {
    type: Array<ContainerInStore>,
    required: true,
  },
});

const containerStore = useContainerStore();

const onTabOpen = async (event: AccordionTabOpenEvent) => {
  await containerStore.getContainerWithProducts(props.containers[event.index]);
};

const openContainerEdit = async (index?: number) => {
  if (index) selectedContainer.value = await containerStore.getContainerWithProducts(props.containers[index - 1]);
  else selectedContainer.value = null;
  visible.value = true;
};

</script>
<style scoped lang="scss">

</style>
