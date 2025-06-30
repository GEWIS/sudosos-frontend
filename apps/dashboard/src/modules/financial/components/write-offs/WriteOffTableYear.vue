<template>
  <DataTableYear :default-year="years[0]" :fetch-records="fetch" :fetch-single-record="single" :year-list="years">
    <template #default="{ isLoading, records, rows, totalRecords, onPage, onSingle }">
      <WriteOffTable
        :is-loading="isLoading"
        :rows="rows"
        :total-records="totalRecords"
        :write-offs="records"
        @page="onPage"
        @single="onSingle"
      />
    </template>
  </DataTableYear>
</template>

<script setup lang="ts">
import type { WriteOffResponse } from '@sudosos/sudosos-client';
import { useFiscalYear } from '@/composables/fiscalYear';
import DataTableYear from '@/components/DataTableYear.vue';
import WriteOffTable from '@/modules/financial/components/write-offs/WriteOffTable.vue';
import { useWriteOffStore } from '@/stores/writeoff.store';
import type { DataTableFetchParams, DataTableFetchResult } from '@/utils/pagination';

const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const writeOffStore = useWriteOffStore();

async function fetch({
  year,
  page,
  rows,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filters,
}: DataTableFetchParams<Record<string, unknown>>): Promise<DataTableFetchResult<WriteOffResponse>> {
  const { start, end } = getFiscalYearRange(year);

  return await writeOffStore.fetchWriteOffs(rows, page, start, end);
}

function single(id: number) {
  return writeOffStore.fetchWriteOff(id);
}
</script>
