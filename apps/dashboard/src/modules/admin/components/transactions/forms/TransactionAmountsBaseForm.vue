<template>
  <div class="flex flex-col gap-4">
    <div v-if="!edit" class="flex flex-col gap-2">
      <span class="font-semibold">{{ t('modules.admin.transactions.currentAmounts') }}:</span>
      <div class="flex flex-col gap-2">
        <div
          v-for="product in products"
          :key="`${product.subTransactionIndex}-${product.rowIndex}`"
          class="flex flex-row gap-2 items-center"
        >
          <span class="w-8 text-right">{{ product.amount }}x</span>
          <span class="flex-1">{{ product.product.name }}</span>
          <span class="font-semibold">{{ formatPrice(product.totalPriceInclVat) }}</span>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col gap-2">
      <span class="font-semibold">{{ t('modules.admin.transactions.editAmounts') }}:</span>
      <div class="flex flex-col gap-2">
        <div
          v-for="product in products"
          :key="`${product.subTransactionIndex}-${product.rowIndex}`"
          class="flex flex-row items-center gap-2"
        >
          <InputNumber
            class="max-w-20"
            :disabled="!edit"
            fluid
            :max="999"
            :min="0"
            :model-value="product.amount"
            suffix="x"
            @update:model-value="updateAmount(product.subTransactionIndex, product.rowIndex, $event)"
          />
          <div class="flex-1">{{ product.product.name }}</div>
          <span class="font-semibold">{{ formatPrice(product.totalPriceInclVat) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import InputNumber from 'primevue/inputnumber';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import * as yup from 'yup';
import type { Form } from '@/utils/formUtils';
import { formatPrice } from '@/utils/formatterUtils';
import { type UpdateAmountItem, updateTransactionAmountsObject } from '@/utils/validation-schema';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionAmountsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: true,
  },
  transaction: {
    type: Object as PropType<TransactionResponse>,
    required: true,
  },
});

const products = computed(() => {
  if (!props.transaction) return [];

  const updatedAmounts = props.form.context.values.updatedAmounts || [];
  const result: { subTransactionIndex: number; rowIndex: number; amount: number }[] = [];

  // Iterate through sub-transactions and their rows directly
  props.transaction.subTransactions.forEach((subTransaction, subTransactionIndex) => {
    subTransaction.subTransactionRows.forEach((row, rowIndex) => {
      // Check if this product has an updated amount
      const updatedAmount = updatedAmounts.find(
        (ua: UpdateAmountItem) => ua.subTransactionIndex === subTransactionIndex && ua.rowIndex === rowIndex,
      );

      // Calculate the correct total price for display
      let displayTotalPrice = row.totalPriceInclVat;
      if (updatedAmount) {
        const pricePerUnit = row.amount > 0 ? row.totalPriceInclVat.amount / row.amount : 0;
        displayTotalPrice = {
          amount: Math.round(updatedAmount.amount * pricePerUnit),
          currency: row.totalPriceInclVat.currency,
          precision: row.totalPriceInclVat.precision,
        };
      }

      result.push({
        ...row,
        subTransactionIndex,
        rowIndex,
        amount: updatedAmount ? updatedAmount.amount : row.amount, // Use updated amount if available
        totalPriceInclVat: displayTotalPrice, // Use calculated total price
      });
    });
  });

  return result;
});

function updateAmount(subTransactionIndex: number, rowIndex: number, amount: number | null) {
  if (amount === null) return;

  // Update the form context - create a new array to trigger reactivity
  const currentAmounts = [...(props.form.context.values.updatedAmounts || [])];
  const existingIndex = currentAmounts.findIndex(
    (item: UpdateAmountItem) => item.subTransactionIndex === subTransactionIndex && item.rowIndex === rowIndex,
  );

  if (existingIndex >= 0) {
    currentAmounts[existingIndex] = { ...currentAmounts[existingIndex], amount };
  } else {
    currentAmounts.push({ subTransactionIndex, rowIndex, amount });
  }

  props.form.context.setFieldValue('updatedAmounts', currentAmounts);
}
</script>
