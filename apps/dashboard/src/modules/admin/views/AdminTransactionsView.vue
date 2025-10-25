<template>
  <PageContainer>
    <div class="flex flex-col gap-5">
      <TransactionSearchCard :initial-value="initialTransactionId" @search="handleSearch" />
      <TransactionDetailCard :error="errorMessage" :transaction="currentTransaction" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { AxiosError } from 'axios';
import PageContainer from '@/layout/PageContainer.vue';
import TransactionSearchCard from '@/modules/admin/components/transactions/TransactionSearchCard.vue';
import TransactionDetailCard from '@/modules/admin/components/transactions/TransactionDetailCard.vue';
import { useTransactionStore } from '@/stores/transaction.store';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const route = useRoute();

const transactionStore = useTransactionStore();
const currentTransaction: Ref<TransactionResponse | null> = ref(null);
const errorMessage = ref<string>('');

// Get initial transaction ID from route query
const initialTransactionId = computed(() => {
  const transactionId = route.query.id;
  if (transactionId && typeof transactionId === 'string') {
    const id = parseInt(transactionId, 10);
    return !isNaN(id) ? id : undefined;
  }
  return undefined;
});

async function handleSearch(id: number) {
  errorMessage.value = '';
  currentTransaction.value = null;

  try {
    currentTransaction.value = await transactionStore.fetchIndividualTransaction(id, apiService);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      errorMessage.value = t('modules.admin.transactions.notFound');
    } else {
      errorMessage.value = t('common.apiError');
    }
  }
}

// Check for transaction ID in route query and auto-search
onMounted(() => {
  const transactionId = route.query.id;
  if (transactionId && typeof transactionId === 'string') {
    const id = parseInt(transactionId, 10);
    if (!isNaN(id)) {
      void handleSearch(id);
    }
  }
});
</script>
