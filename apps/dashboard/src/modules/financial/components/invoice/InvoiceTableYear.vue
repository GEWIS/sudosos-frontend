<template>
  <DataTableYear
    :default-year="years[0]"
    :fetch-records="fetchInvoices"
    :initial-filters="{ state: filterState }"
    :year-list="years"
  >
    <template #default="{ isLoading, records, rows, totalRecords, onPage, onStateFilterChange }">
      <InvoiceTable
        :invoices="records"
        :is-loading="isLoading"
        :rows="rows"
        :total-records="totalRecords"
        @page="onPage"
        @state-filter-change="onStateFilterChange"
      />
    </template>
  </DataTableYear>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataTableYear from '@/components/DataTableYear.vue';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useInvoiceStore } from '@/stores/invoice.store';

const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const invoiceStore = useInvoiceStore();
const filterState = ref(null);

async function fetchInvoices({ year, page, rows, filters }) {
  const { start, end } = getFiscalYearRange(year);
  const queryParams = {
    fromDate: start,
    tillDate: end,
    ...(filters?.state ? { state: filters.state } : {}),
  };
  return await invoiceStore.fetchInvoices(rows, page, queryParams);
}
</script>
