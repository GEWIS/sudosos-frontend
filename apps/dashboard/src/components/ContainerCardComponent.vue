<template>
  <CardComponent :header="$t('containersOverview.Containers')" class="p-0">
    <div v-if="showCreate" class="flex justify-content-end">
      <Button @click="openContainerEdit()">Create</Button>
    </div>
    <Accordion :activeIndex="0" class="block w-full" :multiple="true"
               @tab-open="(event: AccordionTabOpenEvent) => onTabOpen(event)">
      <AccordionTab v-for="container in containers" :key="container.id">
        <template #header>
          <div class="flex justify-content-between w-full">
            <span>
              {{ container.name }}
            </span>
            <div @click="(event) => handleEditClick(event, container.id)" class="px-5">
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
import ContainerCreateDialog from "@/components/ContainerActionsDialog.vue";
import type { ContainerResponse } from "@sudosos/sudosos-client";
import {bool, boolean} from "yup";

const visible = ref(false);
const selectedContainer: Ref<ContainerResponse | null> = ref(null);

const props = defineProps({
  containers: {
    type: Array<ContainerInStore>,
    required: true,
  },
  showCreate: {
    type: Boolean,
    default: false,
  }
});

const containerStore = useContainerStore();

const onTabOpen = async (event: AccordionTabOpenEvent) => {
  await containerStore.getContainerWithProducts(props.containers[event.index]);
};

const handleEditClick = async (event: Event, id: number) => {
  event.stopPropagation();
  await openContainerEdit(id);
}

const openContainerEdit = async (id: number) => {
  if (id) {
    const container = props.containers.find((c) => c.id === id);
    selectedContainer.value = await containerStore.getContainerWithProducts(container, true);
  }
  else selectedContainer.value = null;
  visible.value = true;
};

</script>
<style scoped lang="scss">

</style>
