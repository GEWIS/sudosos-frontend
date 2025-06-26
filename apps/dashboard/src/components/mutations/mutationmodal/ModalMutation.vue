<template>
  <Dialog
    ref="dialog"
    :header="t('components.mutations.modal.header', { id })"
    modal
    :pt="{
      root: { class: 'w-full max-w-[90vw] md:max-w-[33rem]' },
    }"
    :visible="visible"
    @show="addListenerOnDialogueOverlay(dialog)"
  >
    <div v-if="isLoading">
      <Skeleton class="h-2rem my-1 surface-300 w-5" />
      <Skeleton class="h-2rem my-1 surface-300 w-10" />
      <br />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
    </div>

    <TransactionDetailModal v-else-if="transaction" :products-info="products" :transaction-info="transaction" />
    <InvoiceDetailModal v-else-if="shouldShowInvoice" :invoice-info="transfer" />
    <DepositDetailModal v-else-if="shouldShowDeposit" :deposit-info="transfer" />
    <FineDetailModal v-else-if="shouldShowFine" :fine="transfer" />
    <PayoutRequestDetailModal v-else-if="shouldShowPayoutRequest" :payout-request="transfer" />
    <WaivedFineDetailModal v-else-if="shouldShowWaivedFine" :waived-fines="transfer" />
    <template v-if="!shouldShowDeposit && !shouldShowInvoice && shouldShowDeleteButton" #footer>
      <div class="items-end flex flex-col">
        <ConfirmButton
          :initial-label="t('common.delete')"
          icon="pi pi-trash"
          :disabled="false"
          type="submit"
          @confirm="deleteMutation"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, type Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { addListenerOnDialogueOverlay, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import Skeleton from 'primevue/skeleton';
import { useTransactionStore } from '@/stores/transaction.store';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/mutations/mutationmodal/ModalDetailTransaction.vue';
import PayoutRequestDetailModal from '@/components/mutations/mutationmodal/ModalDetailPayoutRequest.vue';
import DepositDetailModal from '@/components/mutations/mutationmodal/ModalDetailDeposit.vue';
import InvoiceDetailModal from '@/components/mutations/mutationmodal/ModalDetailInvoice.vue';
import FineDetailModal from '@/components/mutations/mutationmodal/ModalDetailFine.vue';
import WaivedFineDetailModal from '@/components/mutations/mutationmodal/ModalDetailWaivedFine.vue';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import { FinancialMutationType } from '@/utils/mutationUtils';
import { UserRole } from '@/utils/rbacUtils';
import ConfirmButton from '@/components/ConfirmButton.vue';

const props = defineProps<{
  type: FinancialMutationType;
  id: number;
}>();

const { t } = useI18n();

const visible = ref<boolean>(false);
const transactionStore = useTransactionStore();
const transferStore = useTransferStore();

const dialog = ref();
const toast = useToast();
const userStore = useUserStore();
const isLoading: Ref<boolean> = ref(false);

const transfer = computed(() => transferStore.getTransfer(props.id));

const transaction = computed(() => transactionStore.getTransaction(props.id));
const products = computed(() => getProductsOfTransaction(transaction.value));

const shouldShowDeleteButton = computed(() => {
  // If the transfer is not loaded yet, do not show the delete button.
  if (!transfer.value) return false;
  return userStore.current.rolesWithPermissions.findIndex(
    (r) => (r.name as UserRole) == UserRole.BAC_PM || (r.name as UserRole) == UserRole.BOARD,
  );
});

const shouldShowInvoice = computed(() => {
  if (!transfer.value) return false;
  return props.type === FinancialMutationType.INVOICE;
});

const shouldShowDeposit = computed(() => {
  if (!transfer.value) return false;
  return props.type === FinancialMutationType.DEPOSIT;
});

const shouldShowFine = computed(() => {
  if (!transfer.value) return false;
  return props.type === FinancialMutationType.FINE;
});

const shouldShowWaivedFine = computed(() => {
  if (!transfer.value) return false;
  return props.type === FinancialMutationType.WAIVED_FINE;
});

const shouldShowPayoutRequest = computed(() => {
  if (!transfer.value) return false;
  return props.type === FinancialMutationType.PAYOUT_REQUEST;
});

async function fetchTransferInfo() {
  if (transfer.value) return; // We already have content!
  await transferStore.fetchIndividualTransfer(props.id, apiService).catch((err) => {
    handleError(err, toast);
  });
}

function fetchTransactionInfo() {
  if (transaction.value) return; // We already have content!
  transactionStore.fetchIndividualTransaction(props.id, apiService).catch((err) => {
    handleError(err, toast);
  });
}

function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  const result: Array<SubTransactionRowResponse> = [];
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      result.push(subTransactionRow);
    });
  });
  return result;
}

async function fetchMutation(): Promise<void> {
  if (props.type == FinancialMutationType.TRANSACTION) fetchTransactionInfo();
  else await fetchTransferInfo();
}

// Load on first mount
onMounted(async () => {
  isLoading.value = true;
  await fetchMutation();
  isLoading.value = false;
});

// Reload when closing and opening another
watch(
  () => props.id || props.type,
  async () => {
    isLoading.value = true;
    await fetchMutation();
    isLoading.value = false;
  },
);

const deleteMutation = async () => {
  if (shouldShowFine.value) {
    const transferDetail = transferDetails.value[props.id];

    if (!transferDetail || !transferDetail.fine) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.debtor
      .deleteFine(transferDetail.fine.id)
      .then(() => {
        toast.add({
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.fineDeleted'),
          severity: 'success',
          life: 3000,
        });
        router.go(0);
      })
      .catch((err: AxiosError) => {
        handleError(err, toast);
      });
  } else {
    if (!transaction.value) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.transaction
      .deleteTransaction(transaction.value.id)
      .then(() => {
        toast.add({
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.transactionDeleted'),
          severity: 'success',
          life: 3000,
        });
        router.go(0);
      })
      .catch((err: AxiosError) => {
        handleError(err, toast);
      });
  }
};
</script>

<style scoped lang="scss"></style>
