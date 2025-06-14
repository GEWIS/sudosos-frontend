/** * A component for displaying a transaction history table. * * This component renders a list of recent transactions.
It takes an array of transactions as a * prop and generates a TransactionHistoryRowComponent for each transaction in the
array. * The TransactionHistoryRowComponent displays the details of each transaction and provides an * option to show
more information when clicked. */
<template>
  <div class="flex-col gap-2 h-full mt-2 overflow-y-auto">
    <h1 v-if="transactions.length > 0" class="font-medium text-xl mb-2">Recent Purchases:</h1>
    <TransactionHistoryRowComponent
      v-for="transaction in transactions"
      :key="transaction.id"
      :open="shouldOpen(transaction)"
      :transaction="transaction"
      @update:open="showMoreInfo($event)"
    />
  </div>
</template>

<script setup lang="ts">
import { BaseTransactionResponse } from '@sudosos/sudosos-client';
import { Ref, ref } from 'vue';
import TransactionHistoryRowComponent from '@/components/Cart/TransactionHistory/TransactionHistoryRowComponent.vue';

const props = defineProps({
  transactions: {
    type: Object as () => BaseTransactionResponse[],
    required: true,
  },
});

// Which transaction to open. null means that it should open the top transaction.
const openId: Ref<number | undefined | null> = ref(null);

const shouldOpen = (transaction: BaseTransactionResponse) => {
  return transaction.id === openId.value || (openId.value === null && transaction.id === props.transactions[0].id);
};

// Function to handle onClick of rows. If same row is pressed twice we close it again.
const showMoreInfo = (event: number) => {
  if (openId.value === event) openId.value = undefined;
  else openId.value = event;
};
</script>

<style scoped lang="scss"></style>
