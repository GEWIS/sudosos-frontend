<template>
  <DataTableYear :default-year="years[0]" :fetch-records="fetch" :year-list="years">
    <template #default="{ isLoading, records, rows, totalRecords, onPage }">
      <WriteOffTable
        :is-loading="isLoading"
        :rows="rows"
        :total-records="totalRecords"
        :write-offs="records"
        @page="onPage"
      />
    </template>
  </DataTableYear>
</template>

<script setup lang="ts">
import { useFiscalYear } from '@/composables/fiscalYear';
import DataTableYear from '@/components/DataTableYear.vue';
import WriteOffTable from '@/modules/financial/components/write-offs/WriteOffTable.vue';
import { useWriteOffStore } from '@/stores/writeoff.store';

const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const writeOffStore = useWriteOffStore();

async function fetch({ year, page, rows }) {
  const { start, end } = getFiscalYearRange(year);
  return await writeOffStore.fetchWriteOffs(rows, page, start, end);
}
</script>
