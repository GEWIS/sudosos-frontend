<template>
  <DataTable striped-rows :value="financialMutations">
    <Column class="text-left" field="transferType" header="Type" header-class="font-sans" />

    <Column field="credit" header="Credit" header-class="font-sans text-right" class="font-mono text-right">
      <template #body="{ data }">{{ new Intl.NumberFormat('en-DE').format(data.credit || 0) }}</template>
    </Column>

    <Column field="debit" header="Debit" header-class="font-sans text-right" class="font-mono text-right">
      <template #body="{ data }">{{ new Intl.NumberFormat('en-DE').format(data.debit || 0) }}</template>
    </Column>

    <Column header="Saldo" header-class="font-sans text-right" class="font-mono text-right">
      <template #body="{ data }">
        {{ new Intl.NumberFormat('en-DE').format((data.credit || 0) - (data.debit || 0)) }}
      </template>
    </Column>

    <Column class="w-2" :header="t('common.actions')" header-class="font-sans">
      <template #body>
        <Button class="p-button-rounded p-button-text" icon="pi pi-window-maximize" />
      </template>
    </Column>

    <ColumnGroup type="footer">
      <Row>
        <Column :colspan="3" footer="Total" />
        <Column
          class="font-mono text-right"
          :footer="
            new Intl.NumberFormat('en-DE').format(
              financialMutations.reduce((acc, r) => acc + (r.credit || 0) - (r.debit || 0), 0),
            )
          "
        />
        <Column />
      </Row>

      <Row>
        <Column :colspan="3" footer="Balance 01-07-2024" />
        <Column :footer="new Intl.NumberFormat('en-DE').format(12345)" class="font-mono text-right" />
        <Column />
      </Row>

      <Row>
        <Column :colspan="3" footer="Balance 30-06-2025" />
        <Column
          class="font-mono text-right"
          :footer="
            new Intl.NumberFormat('en-DE').format(
              12345 + financialMutations.reduce((acc, r) => acc + (r.credit || 0) - (r.debit || 0), 0),
            )
          "
        />
        <Column />
      </Row>
    </ColumnGroup>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import { useFinancialOverviewStore } from '@/stores/financial-overview.store.ts';

const props = defineProps<{
  year: number;
  sellers: UserResponse[];
}>();

interface FinancialOverviewTableRow {
  transferType: string;
  credit: number;
  debit: number;
  link: string;
}

const { t } = useI18n();
const financialOverviewStore = useFinancialOverviewStore();
const financialMutations = ref<FinancialOverviewTableRow[]>([
  {
    transferType: 'Topups',
    credit: 100.0,
    debit: 0.0,
    link: '',
  },
  {
    transferType: 'Fines',
    credit: 0.0,
    debit: 25.0,
    link: '',
  },
  {
    transferType: 'Write-offs',
    credit: 0.0,
    debit: 15.75,
    link: '/financial/overview/write-offs',
  },
  {
    transferType: 'Invoices',
    credit: 0.0,
    debit: 120.0,
    link: '/financial/invoice',
  },
]);

onMounted(() => {
  props.sellers.forEach((seller) => {
    const mutations = financialOverviewStore.mutations[seller.id];
    const totalMutations =
      mutations.reduce((acc, r) => acc + ('value' in r.mutation ? r.mutation.value.amount || 0 : 0), 0) || 0;
    const payouts = financialOverviewStore.payouts[seller.id];
    const totalPayouts = payouts.reduce((acc, r) => acc + r.amount.amount, 0);
    if (totalMutations === 0 && totalPayouts === 0) {
      return;
    }
    financialMutations.value.push({
      transferType: `${seller.firstName} - Transactions`,
      credit: 0.0,
      debit: totalMutations,
      link: '',
    });
    financialMutations.value.push({
      transferType: `${seller.firstName} - Payouts`,
      credit: totalPayouts,
      debit: 0.0,
      link: '',
    });
  });
});
</script>

<style scoped lang="scss"></style>
