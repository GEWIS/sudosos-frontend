<template>
  <div class="flex flex-col gap-5">
    <DataTable
      class="w-full"
      data-key="id"
      filter-display="menu"
      :filters="filters"
      lazy
      :paginator="true"
      :rows="rows"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="invoices"
      @page="onPage"
    >
      <Column class="max-w-[2rem]" field="id" :header="t('common.id')">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 max-w-[2rem]" />
            <span v-else>
              {{ slotProps.data.id }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="date" :header="t('common.date')">
        <template #body="{ data }">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-6" />
            <span
              v-else-if="isBackDate(data)"
              v-tooltip="
                t('modules.financial.invoice.backDate', { date: formatDateFromString(data.transfer.createdAt) })
              "
              class="text-red-500"
            >
              {{ formatDateFromString(data.date) }}
            </span>
            <span v-else>
              {{ formatDateFromString(data.date) }}
            </span>
          </div>
        </template>
      </Column>

      <Column
        field="currentState.state"
        filter
        filter-match-mode="equals"
        :header="t('common.status')"
        :show-apply-button="false"
        :show-clear-button="false"
        :show-filter-match-modes="false"
      >
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            option-label="name"
            option-value="value"
            :options="states"
            :placeholder="t('common.placeholders.selectType')"
            @change="(e) => stateFilterChange('state', e)"
          />
        </template>
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-6" />
            <span v-else>
              {{ slotProps.data.currentState.state }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="to.firstName" :header="t('common.for')" style="max-width: 15rem">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-6" />
            <span v-else class="truncate">
              {{ slotProps.data.to.firstName }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="description" :header="t('common.description')" style="max-width: 10rem">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-6" />
            <span v-else class="truncate">
              {{ slotProps.data.description }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="transfer.amount" :header="t('common.amount')">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-3" />
            <span v-else>
              {{ formatPrice(slotProps.data.transfer?.amount) }}
            </span>
          </div>
        </template>
      </Column>

      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed surface-300 w-3" />
            <span v-else>
              <Button
                class="p-button-plain p-button-rounded p-button-text"
                icon="pi pi-eye"
                type="button"
                @click="() => viewInvoice(slotProps.data.id)"
              />
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import { type SelectChangeEvent } from 'primevue/select';
import { useI18n } from 'vue-i18n';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import { type Ref, ref } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import router from '@/router';
import { useFiscalYear } from '@/composables/fiscalYear';

defineProps({
  invoices: {
    type: Array,
    required: true,
  },
  totalRecords: {
    type: Number,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
  rows: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['page', 'stateFilterChange']);

const { t } = useI18n();

function onPage(event: DataTablePageEvent) {
  emit('page', event);
}

function stateFilterChange(key: string, e: SelectChangeEvent) {
  emit('stateFilterChange', key, e.value);
}

const states: Ref<Array<{ name: string; value: string | null }>> = ref([
  { name: InvoiceStatusResponseStateEnum.Created, value: InvoiceStatusResponseStateEnum.Created },
  { name: InvoiceStatusResponseStateEnum.Sent, value: InvoiceStatusResponseStateEnum.Sent },
  { name: InvoiceStatusResponseStateEnum.Paid, value: InvoiceStatusResponseStateEnum.Paid },
  { name: InvoiceStatusResponseStateEnum.Deleted, value: InvoiceStatusResponseStateEnum.Deleted },
  { name: 'ALL', value: null },
]);

function viewInvoice(id: number) {
  const route = router.resolve({ name: 'invoiceInfo', params: { id } });
  window.open(route.href, '_blank');
}

const filters = ref({
  'currentState.state': { value: null, matchMode: 'equals' },
});

// isBackDate should check if the createdAt date is in the same 202Y-07-01 202(Y+1)-07-01 range
const { getFiscalYear } = useFiscalYear();

function isBackDate(invoice: InvoiceResponse): boolean {
  if (!invoice.createdAt || !invoice.date) return false;

  // Use getFiscalYear from your composable
  const fyCreatedAt = getFiscalYear(invoice.createdAt);
  const fyDate = getFiscalYear(invoice.date);

  return fyCreatedAt !== fyDate;
}
</script>

<style scoped lang="scss">
.truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skeleton-fixed {
  height: 1rem;
  margin: 0;
  display: block;
}
</style>
