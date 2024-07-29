<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('invoice.invoiceOverview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-column flex-column">
      <InvoiceTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceTable from "@/modules/financial/components/InvoiceTable.vue";

</script>

<style scoped lang="scss">

</style>
