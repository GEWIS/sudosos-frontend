<template>
  <CardComponent :header="$t('containersOverview.Containers')" class="p-0">
<!--    TODO re-add newContainer button -->
<!--    <TabView :active-index=1 class="hidden md:block" :scrollable="true">-->
<!--      <TabPanel v-for="container in containers" :key="container.id" :header="container.name">-->
<!--        <ProductGridComponent :container="container" :products="container.products"/>-->
<!--      </TabPanel>-->
<!--      <TabPanel>-->
<!--        <template #header>-->
<!--           <span class="p-tabview-title createContainerButton">{{ $t('containersOverview.newContainer') }}</span>-->
<!--        </template>-->
<!--      </TabPanel>-->
<!--    </TabView>-->
    <Accordion :activeIndex="0" class="block w-full" :multiple="true"
               @tab-open="(event: AccordionTabOpenEvent) => onTabOpen(event)">
      <AccordionTab v-for="container in containers" :key="container.id" :header="container.name">
        <ProductGridComponent :container="container"/>
      </AccordionTab>
    </Accordion>
  </CardComponent>

</template>
<script setup lang="ts">
import ProductGridComponent from "@/components/ProductGridComponent.vue";
import CardComponent from "./CardComponent.vue";
import Accordion, { type AccordionTabOpenEvent } from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import { type ContainerInStore, useContainerStore } from "@/stores/container.store";

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
</script>
<style scoped lang="scss">

</style>
