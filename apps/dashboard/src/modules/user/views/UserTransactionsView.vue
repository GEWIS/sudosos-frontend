<template>
  <div class="page-container">
    <div class="page-title">{{ $t('transactions.Transactions') }}</div>
    <div class="content-wrapper">
      <MutationsTableComponent
        class="transactions-table"
        :header="$t('c_recentTransactionsTable.recent transactions')"
        :paginatedMutationResponse="financialMutationsResponse"
        :modal="true"
        :paginator="true"
        :callbackFunction="getUserMutations"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MutationsTableComponent from '@/components/mutations/MutationsTableComponent.vue';
import apiService from '@/services/ApiService';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { ref } from 'vue';
import type { PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { handleError } from '@/utils/errorUtils';
import router from '@/router';
import { useI18n } from "vue-i18n";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { t, locale } = useI18n();

const financialMutationsResponse = ref<PaginatedFinancialMutationResponse>({
  _pagination: {
    take: 0,
    skip: 0,
    count: 0,
  },
  records: []
});

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const getUserMutations = async (take: number, skip: number)
  : Promise<PaginatedFinancialMutationResponse | undefined> => {
  if (!authStore.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchUsersFinancialMutations(authStore.getUser.id, apiService, take, skip)
    .catch((err) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};
</script>

<style scoped lang="scss">
</style>
