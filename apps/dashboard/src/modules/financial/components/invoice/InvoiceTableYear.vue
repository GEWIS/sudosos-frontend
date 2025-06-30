<template>
  <IconField icon-position="left">
    <InputIcon class="pi pi-search" />
    <InputText
      v-model="searchId"
      :placeholder="t('common.id')"
      @focusout="searchById"
      @keyup.enter="searchById"
      @submit="searchById"
    />
  </IconField>
  <DataTableYear
    ref="dataTableYearRef"
    :default-year="years[0]"
    :fetch-records="fetchInvoices"
    :fetch-single-record="fetchSingleInvoice"
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
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTableYear from '@/components/DataTableYear.vue';
import InvoiceTable from '@/modules/financial/components/invoice/InvoiceTable.vue';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useInvoiceStore } from '@/stores/invoice.store';

const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const invoiceStore = useInvoiceStore();
const filterState = ref(null);
const searchId = ref(null);

const { t } = useI18n();
const toast = useToast();

async function fetchInvoices({ year, page, rows, filters }) {
  const { start, end } = getFiscalYearRange(year);
  const queryParams = {
    fromDate: start,
    tillDate: end,
    ...(filters?.state ? { state: filters.state } : {}),
  };
  return await invoiceStore.fetchInvoices(rows, page, queryParams);
}

async function fetchSingleInvoice(id: number) {
  return await invoiceStore.fetchInvoice(id);
}

const dataTableYearRef = ref<InstanceType<typeof DataTableYear>>();
function searchById() {
  dataTableYearRef.value?.onSingle(searchId.value).catch(() => {
    toast.add({
      severity: 'warn',
      summary: t('common.toast.info.info'),
      detail: t('modules.financial.invoice.searchId.not-possible'),
      life: 3000,
    });
  });
}
</script>
