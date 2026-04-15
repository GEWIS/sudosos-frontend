<template>
  <IconField icon-position="left">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="searchInput"
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
import { type InvoiceResponseTypes, type InvoiceStatusResponseStateEnum } from '@gewis/sudosos-client';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useInvoiceStore } from '@/stores/invoice.store';
import { useTransferTableYear, type TransferTableFetchParams } from '@/composables/transferTableYear';

const { t } = useI18n();
const invoiceStore = useInvoiceStore();

async function fetchInvoices({
  page,
  rows,
  filters,
  fiscalStart,
  fiscalEnd,
}: TransferTableFetchParams<{ state?: InvoiceStatusResponseStateEnum }>) {
  return await invoiceStore.fetchInvoices(rows, page, {
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
    ...(filters?.state ? { state: filters.state } : {}),
  });
}

async function fetchSingleInvoice(id: number) {
  return await invoiceStore.fetchInvoice(id);
}

const { year, years, rows, isLoading, records, totalRecords, onPage, setFilter, searchInput, searchById } =
  useTransferTableYear<InvoiceResponseTypes, { state?: InvoiceStatusResponseStateEnum }>(
    fetchInvoices,
    fetchSingleInvoice,
    { initialFilters: { state: undefined }, syncQueryParams: true },
  );
</script>
