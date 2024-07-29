<template>
  <div class="flex flex-col gap-5">
    <DataTable :value="unpaid" tableStyle="min-width: 50rem">
      <Column field="id" header="ID"></Column>
      <Column field="createdAt" header="Created">
        <template #body="slotProps">
          {{ formatDateFromString(slotProps.data.createdAt) }}
        </template>
      </Column>
      <Column field="currentState.state" header="State"></Column>
      <Column field="to.firstName" header="To"></Column>
      <Column field="description" header="Description"></Column>
      <Column field="transfer" header="Amount">
        <template #body="slotProps">
          {{ formatPrice(slotProps.data.transfer.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useInvoiceStore } from "@/stores/invoice.store";
import { computed, onMounted } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { formatPrice } from "@/utils/formatterUtils";
import { formatDateFromString } from "@/utils/formatterUtils";

const invoiceStore = useInvoiceStore();
const invoices = computed<InvoiceResponse[]>(() => Object.values(invoiceStore.getAll));

function isUnpaid(invoice: InvoiceResponse) {
  return invoice.currentState.state === InvoiceStatusResponseStateEnum.Created ||
      invoice.currentState.state === InvoiceStatusResponseStateEnum.Sent;
}
const unpaid = computed<InvoiceResponse[]>(() => invoices.value.filter( (i) => isUnpaid(i)));

onMounted(async () => {
  await invoiceStore.fetchAll();
});

</script>

<style scoped lang="scss">

</style>
