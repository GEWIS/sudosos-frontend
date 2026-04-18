<template>
  <IconField icon-position="left">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="search"
      :placeholder="t('common.id')"
      @focusout="searchById"
      @keyup.enter="searchById"
      @submit="searchById"
    />
  </IconField>
  <Tabs v-model:value="year" class="w-full">
    <TabList>
      <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
    </TabList>
  </Tabs>
  <InvoiceTable
    :invoices="records"
    :is-loading="isLoading"
    :rows="rows"
    :total-records="totalRecords"
    @page="onPage"
    @state-filter-change="setFilter"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { type InvoiceResponseTypes, InvoiceStatusResponseStateEnum } from '@gewis/sudosos-client';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useInvoiceStore } from '@/stores/invoice.store';
import { useTransferTableYear } from '@/composables/transferTableYear';

const invoiceStore = useInvoiceStore();
const { t } = useI18n();

async function fetchInvoices({
  page,
  rows,
  filters,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: { state?: InvoiceStatusResponseStateEnum };
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return await invoiceStore.fetchInvoices(rows, page, {
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
    state: filters.state,
  });
}

async function fetchSingleInvoice(id: number) {
  return await invoiceStore.fetchInvoice(id);
}

const { year, years, search, rows, isLoading, records, totalRecords, onPage, setFilter, searchById } =
  useTransferTableYear<InvoiceResponseTypes, { state?: InvoiceStatusResponseStateEnum }>(
    fetchInvoices,
    fetchSingleInvoice,
    {
      initialFilters: { state: undefined },
      defaultRows: 10,
      syncQueryParams: {
        serializeFilters: (f) => ({ state: f.state }),
        deserializeFilters: (q) => ({
          state: typeof q.state === 'string' ? (q.state as InvoiceStatusResponseStateEnum) : undefined,
        }),
      },
    },
  );
</script>
