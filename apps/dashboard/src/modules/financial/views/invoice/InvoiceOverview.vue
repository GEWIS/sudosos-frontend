<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('c_invoiceInfo.InvoiceOverview') }}</div>
      <div class="content-wrapper flex flex-column gap-5">
          <TabView class="w-full">
            <TabPanel v-for="state in states" :key="state" :header="state">
              <InvoiceTable :state="state" />
            </TabPanel>
          </TabView>
          <InvoiceUserTable />
      </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTable from "@/modules/financial/components/invoice/InvoiceTable.vue";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import InvoiceUserTable from "@/modules/financial/components/invoice/InvoiceUserTable.vue";

const states = [ InvoiceStatusResponseStateEnum.Created, InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid, InvoiceStatusResponseStateEnum.Deleted ];

</script>

<style scoped lang="scss">

</style>
