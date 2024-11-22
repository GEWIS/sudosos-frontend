<template>
  <div class="flex flex-col gap-5">
    <DataTable
      :rows="rows"
      :value="rowValues"
      :rows-per-page-options="[5,10,25,50,100]"
      :paginator="paginator"
      v-model:selection="selectedDebtors"
      lazy
      @page="onPage($event)"
      :total-records="totalRecords"
      data-key="id"
      class="w-full"
      table-style="min-width: 60rem"
    >

        <div class="flex flex-row align-items-center justify-content-end" style="gap: 1rem">
          <Button
              :label="t('modules.financial.debtor.makeInactive')"
              icon="pi pi-lock"
              @click="setDebtorInactive"
          />
          <Button
              :label="t('modules.financial.debtor.writeOffAndClose')"
              icon="pi pi-times-circle"
              @click="writeOffUser"
          />
        </div>

      <Column selectionMode="multiple"></Column>
      <Column field="firstName" :header="t('common.firstName')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.firstName }}</span>
        </template>
      </Column>
      <Column field="lastName" :header="t('common.lastName')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.lastName }}</span>
        </template>
      </Column>
      <Column field="amount.amount" :header="t('modules.financial.debtor.balance')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column field="fine.amount" :header="t('modules.financial.debtor.totalFine')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.fine) }}</span>
        </template>
      </Column>
      <Column field="nrFines" :header="t('modules.financial.debtor.nrFines')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.nrFines }}</span>
        </template>
      </Column>
      <Column field="active" :showFilterMatchModes="false">
        <template #header>
          <div class="flex flex-row gap-2 align-items-center">
            {{ t("common.active") }}
            <Checkbox
                v-model="isActiveFilter"
                @change="onFilter()"
                binary
            />
          </div>
        </template>
        <template #body v-if="isLoading">
          <Skeleton class="w-2 my-1 h-1rem surface-300"/>
        </template>
      </Column>
      <Column
          headerStyle="width: 3rem; text-align: center"
          bodyStyle="text-align: center; overflow: visible"
      >
        <template #body v-if="isLoading">
          <Skeleton class="w-4 my-1 h-1rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>
          <Button
              @click="handleInfoPush(slotProps.data.id)"
              type="button"
              icon="pi pi-info-circle"
              outlined
          />
        </template>

      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">

import { useI18n } from "vue-i18n";
import { computed, onMounted, type Ref, ref } from "vue";
import DataTable, { type DataTablePageEvent } from "primevue/datatable";
import Column from 'primevue/column';
import { formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";
import Skeleton from "primevue/skeleton";
import router from "@/router";
import apiService from "@/services/ApiService";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import Checkbox from "primevue/checkbox";
import {useUserStore} from "@sudosos/sudosos-frontend-common";

const { t } = useI18n();

const toast = useToast();
const userStore = useUserStore();
const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const isActiveFilter: Ref<boolean> = ref(true);
const rows = ref<number>(10);
const paginator = ref<boolean>(true);

const debtors = ref();
const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return debtors.value;
});

onMounted(async () => {
  await loadDebtors();
});

async function loadDebtors(skip = 0) {
  isLoading.value = true;
  const response = await debtorStore.fetchDebtors(rows.value, skip);
  if (response && response._pagination) {
    debtors.value = response.debtors as DebtorsResponse[];
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

const setDebtorInactive = async () => {
  if (!selectedDebtors.value) return;
  await Promise.all(selectedDebtors.value.map(async (d) => {
     apiService.user.updateUser(d.id, { active: false }).then(() => {
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.userUpdated'),
        severity: 'success',
        life: 3000
      });
    }).catch((err) => {
      handleError(err, toast);
    });
  }));
};

const writeOffUser = async () => {
  if (!selectedDebtors.value) return;
  await Promise.all(selectedDebtors.value.map(async (d) => {
    apiService.writeOffs.createWriteOff({ toId: d.id }).then(() => {
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.userUpdated'),
        severity: 'success',
        life: 3000
      });
    }).catch((err) => {
      handleError(err, toast);
    });
  }));
};

async function onPage(event: DataTablePageEvent) {
  await loadDebtors(event.first);
}

async function handleInfoPush(userId: number) {
  router.push({ name: 'user', params: { userId } });
}
</script>

<style scoped lang="scss">
/* Add your custom styles here */
</style>