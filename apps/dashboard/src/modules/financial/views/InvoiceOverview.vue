<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.invoiceOverview') }}</div>
      <div class="content-wrapper gap-5 flex md:flex-column flex-column">
        <CardComponent :header="$t('c_invoiceInfo.Invoices')">
          <InvoiceTable />
        </CardComponent>
      </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTable from "@/modules/financial/components/InvoiceTable.vue";
import CardComponent from "@/components/CardComponent.vue";

</script>

<style scoped lang="scss">

</style>
