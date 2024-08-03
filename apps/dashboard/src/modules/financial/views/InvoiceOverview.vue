<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.invoiceOverview') }}</div>
      <div class="content-wrapper gap-5 flex md:flex-column flex-column">
        <CardComponent :header="$t('c_invoiceInfo.Invoices')">
          <TabView class="w-full">
            <TabPanel v-for="state in states" :key="state" :header="state">
              <InvoiceTable :state="state" />
            </TabPanel>
          </TabView>
        </CardComponent>
      </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTable from "@/modules/financial/components/InvoiceTable.vue";
import CardComponent from "@/components/CardComponent.vue";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";

const states = [ InvoiceStatusResponseStateEnum.Created, InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid, InvoiceStatusResponseStateEnum.Deleted ];

</script>

<style scoped lang="scss">

</style>
