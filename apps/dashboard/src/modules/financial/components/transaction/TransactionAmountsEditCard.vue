<template>
  <FormCard
    v-if="transaction"
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.admin.transactions.editAmounts')"
    @cancel="handleCancel"
    @save="handleSave"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <TransactionAmountsUpdateForm :edit="edit" :form="form" :transaction="transaction" @update:edit="edit = $event" />
    </div>
  </FormCard>

  <TransactionAmountsConfirmDialog
    :transaction="transaction"
    :updated-amounts="selectedUpdatedAmounts"
    :visible="showConfirmDialog"
    @cancel="handleCancelConfirm"
    @confirm="handleConfirm"
    @update:visible="showConfirmDialog = $event"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import TransactionAmountsUpdateForm from './forms/TransactionAmountsUpdateForm.vue';
import TransactionAmountsConfirmDialog from './TransactionAmountsConfirmDialog.vue';
import FormCard from '@/components/FormCard.vue';
import { updateTransactionAmountsObject } from '@/utils/validation-schema';
import { schemaToForm, getProperty } from '@/utils/formUtils';
import { useTransactionCard } from '../../composables/useTransactionCard';
import { useTransactionForm } from '../../composables/useTransactionForm';

const { t } = useI18n();
const props = defineProps<{ transactionId: number }>();

const form = schemaToForm(updateTransactionAmountsObject);
const { transaction, canEdit, edit } = useTransactionCard(props.transactionId);

useTransactionForm(transaction, form, () => ({
  updatedAmounts: [],
}));

const showConfirmDialog = ref(false);
const selectedUpdatedAmounts = ref<
  Array<{
    subTransactionIndex: number;
    rowIndex: number;
    amount: number;
  }>
>([]);

function handleSave() {
  const dirty = form.context.meta.value.dirty;
  if (!dirty) {
    edit.value = false;
    return;
  }

  // Get the updated amounts from the form
  const updatedAmounts = getProperty(form, 'updatedAmounts') as
    | Array<{
        subTransactionIndex: number;
        rowIndex: number;
        amount: number;
      }>
    | undefined;

  if (!updatedAmounts || updatedAmounts.length === 0 || !transaction.value) return;

  // Show confirmation dialog
  selectedUpdatedAmounts.value = updatedAmounts;
  showConfirmDialog.value = true;
}

async function handleConfirm() {
  // Trigger the form submission
  await form.submit();
  showConfirmDialog.value = false;
}

function handleCancel() {
  // Reset the form back to original state
  form.context.resetForm();
  edit.value = false;
}

function handleCancelConfirm() {
  showConfirmDialog.value = false;
  // Stay in edit mode
}
</script>
