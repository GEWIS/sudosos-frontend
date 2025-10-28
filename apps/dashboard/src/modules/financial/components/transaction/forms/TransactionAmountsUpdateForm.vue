<template>
  <TransactionAmountsBaseForm :edit="edit" :form="form" :transaction="transaction" />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import type { AxiosError } from 'axios';
import TransactionAmountsBaseForm from './TransactionAmountsBaseForm.vue';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateTransactionAmountsObject } from '@/utils/validation-schema';
import { useTransactionStore } from '@/stores/transaction.store';
import { handleError } from '@/utils/errorUtils';
import { transactionResponseToRequest } from '@/utils/transactionUtil';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();
const transactionStore = useTransactionStore();

const props = defineProps({
  transaction: {
    type: Object as PropType<TransactionResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionAmountsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  'update:edit': [value: boolean];
}>();

// Set up the form submission handler
setSubmit(props.form, async () => {
  const values = props.form.context.values;
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }

  try {
    // Get the updated amounts from form values
    const updatedAmounts = values.updatedAmounts as Array<{
      subTransactionIndex: number;
      rowIndex: number;
      amount: number;
    }>;

    if (!updatedAmounts || updatedAmounts.length === 0) {
      throw new Error(t('modules.admin.transactions.missingAmountsData'));
    }

    // Reconstruct the full transaction request
    const fullTransactionRequest = transactionResponseToRequest(props.transaction);

    // Apply the amount changes and recalculate prices
    updatedAmounts.forEach(({ subTransactionIndex, rowIndex, amount }) => {
      if (fullTransactionRequest.subTransactions[subTransactionIndex]?.subTransactionRows[rowIndex]) {
        const row = fullTransactionRequest.subTransactions[subTransactionIndex].subTransactionRows[rowIndex];
        const originalRow = props.transaction.subTransactions[subTransactionIndex].subTransactionRows[rowIndex];

        // Update amount
        row.amount = amount;

        // Recalculate totalPriceInclVat for this row
        // Use the original price per unit to calculate new total
        const pricePerUnit = originalRow.amount > 0 ? originalRow.totalPriceInclVat.amount / originalRow.amount : 0;
        row.totalPriceInclVat = {
          amount: Math.round(amount * pricePerUnit),
          currency: originalRow.totalPriceInclVat.currency,
          precision: originalRow.totalPriceInclVat.precision,
        };
      }
    });

    // Remove items with amount 0 from sub-transactions
    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      subTransaction.subTransactionRows = subTransaction.subTransactionRows.filter((row) => (row.amount ?? 0) > 0);
    });

    // Remove empty sub-transactions
    fullTransactionRequest.subTransactions = fullTransactionRequest.subTransactions.filter(
      (subTransaction) => subTransaction.subTransactionRows.length > 0,
    );

    // Check if transaction would be empty after removing items
    if (fullTransactionRequest.subTransactions.length === 0) {
      throw new Error(t('modules.admin.transactions.cannotRemoveAllItems'));
    }

    // Recalculate sub-transaction totals
    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      let subTotalAmount = 0;
      let currency = 'EUR';
      let precision = 2;

      subTransaction.subTransactionRows.forEach((row) => {
        subTotalAmount += row.totalPriceInclVat.amount;
        currency = row.totalPriceInclVat.currency;
        precision = row.totalPriceInclVat.precision;
      });

      subTransaction.totalPriceInclVat = {
        amount: subTotalAmount,
        currency,
        precision,
      };
    });

    // Recalculate overall transaction total
    let transactionTotalAmount = 0;
    let currency = 'EUR';
    let precision = 2;

    fullTransactionRequest.subTransactions.forEach((subTransaction) => {
      transactionTotalAmount += subTransaction.totalPriceInclVat.amount;
      currency = subTransaction.totalPriceInclVat.currency;
      precision = subTransaction.totalPriceInclVat.precision;
    });

    fullTransactionRequest.totalPriceInclVat = {
      amount: transactionTotalAmount,
      currency,
      precision,
    };

    // Submit the complete transaction
    await transactionStore.updateTransaction(props.transaction.id, fullTransactionRequest, apiService);

    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('modules.admin.transactions.amountsUpdated'),
      life: 3000,
    });

    emit('update:edit', false);
  } catch (error) {
    handleError(error as AxiosError, toast);
  }
});
</script>
