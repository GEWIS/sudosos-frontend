<template>
  <CardComponent :header="$t('containersOverview.Containers')" class="p-0">
    <TabView :active-index=1 class="hidden md:block" :scrollable="true">
      <TabPanel v-for="container in containers" :key="container.id" :header="container.name">
        <ProductGridComponent :container="container" :products="container.products"/>
      </TabPanel>
      <TabPanel>
        <template #header>
            <span class="p-tabview-title createContainerButton">{{ $t('containersOverview.newContainer') }}</span>
        </template>
      </TabPanel>
    </TabView>
    <Accordion :activeIndex="0" class="block md:hidden w-full">
      <AccordionTab v-for="container in containers" :key="container.id" :header="container.name">
        <ProductGridComponent :container="container" :products="container.products"/>
      </AccordionTab>
    </Accordion>
  </CardComponent>

</template>
<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";


defineProps({
  containers: {
    type: Array<ContainerWithProductsResponse>,
    required: true,
  },
});
</script>
<style scoped lang="scss">

</style>
