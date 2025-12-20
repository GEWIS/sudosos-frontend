<template>
  <PageContainer>
    <div class="flex flex-col gap-4">
      <CardComponent class="w-full" :header="t('modules.financial.administrative.title')">
        <div class="flex flex-col gap-4">
          <AdministrativeCostsFilters :filters="filters" @update:filters="handleFilterChange" @clear="clearFilters" />
          <AdministrativeCostsTable
            :costs="costs"
            :is-loading="isLoading"
            :pagination="pagination"
            :rows="rows"
            :rows-per-page-options="rowsPerPageOptions"
            @page="onPage"
            @view="handleView"
            @delete="handleDelete"
            @bulk-delete="handleBulkDelete"
          />
        </div>
      </CardComponent>

      <EligibleUsersPage />
    </div>

    <AdministrativeCostDetailView
      v-model:visible="showDetailDialog"
      :cost-id="selectedCostId"
      @close="showDetailDialog = false"
      @delete="handleDelete"
    />

    <ConfirmDialog />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import AdministrativeCostsTable from '@/modules/financial/components/administrative/AdministrativeCostsTable.vue';
import AdministrativeCostsFilters from '@/modules/financial/components/administrative/AdministrativeCostsFilters.vue';
import AdministrativeCostDetailView from '@/modules/financial/components/administrative/AdministrativeCostDetailView.vue';
import EligibleUsersPage from '@/modules/financial/components/administrative/EligibleUsersPage.vue';
import { useAdministrativeCosts } from '@/composables/useAdministrativeCosts';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';
import { handleError } from '@/utils/errorUtils';
import { AxiosError } from 'axios';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const {
  costs,
  pagination,
  isLoading,
  filters,
  rows,
  rowsPerPageOptions,
  onPage,
  setFilter,
  clearFilters: clearFiltersComposable,
} = useAdministrativeCosts();

const store = useAdministrativeCostsStore();

const showDetailDialog = ref(false);
const selectedCostId = ref<number | undefined>();

function handleFilterChange(newFilters: { fromId?: number; inactiveAdministrativeCostId?: number }) {
  if (newFilters.fromId !== undefined) {
    setFilter('fromId', newFilters.fromId);
  } else {
    setFilter('fromId', undefined);
  }
  if (newFilters.inactiveAdministrativeCostId !== undefined) {
    setFilter('inactiveAdministrativeCostId', newFilters.inactiveAdministrativeCostId);
  } else {
    setFilter('inactiveAdministrativeCostId', undefined);
  }
}

function clearFilters() {
  clearFiltersComposable();
}

function handleView(id: number) {
  selectedCostId.value = id;
  showDetailDialog.value = true;
}

function handleDelete(id: number) {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.confirm.delete'),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      try {
        await store.deleteCost(id);
        toast.add({
          summary: t('common.toast.success.success'),
          detail: t('modules.financial.administrative.deleteSuccess'),
          severity: 'success',
          life: 3000,
        });
        showDetailDialog.value = false;
        await store.fetchCosts({
          ...filters.value,
          take: rows.value,
          skip: 0,
        });
      } catch (err) {
        if (err instanceof AxiosError) {
          handleError(err, toast);
        } else {
          console.error(err);
        }
      }
    },
  });
}

function handleBulkDelete(ids: number[]) {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.confirm.bulkDelete', { count: ids.length }),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: async () => {
      try {
        await Promise.all(ids.map((id) => store.deleteCost(id)));
        toast.add({
          summary: t('common.toast.success.success'),
          detail: t('modules.financial.administrative.bulkDeleteSuccess', { count: ids.length }),
          severity: 'success',
          life: 3000,
        });
        await store.fetchCosts({
          ...filters.value,
          take: rows.value,
          skip: 0,
        });
      } catch (err) {
        if (err instanceof AxiosError) {
          handleError(err, toast);
        } else {
          console.error(err);
        }
      }
    },
  });
}
</script>

<style scoped lang="scss"></style>
