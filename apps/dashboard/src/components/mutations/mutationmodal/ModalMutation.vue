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
    <InvoiceDetailModal v-else-if="isType('invoice')" :invoice-info="transfer" />
    <DepositDetailModal v-else-if="isType('deposit')" :deposit-info="transfer" />
    <FineDetailModal v-else-if="isType('fine')" :fine="transfer" />
    <PayoutRequestDetailModal v-else-if="isType('payoutRequest')" :payout-request="transfer" />
    <WaivedFineDetailModal v-else-if="isType('waivedFine')" :waived-fines="transfer" />

    <template v-if="canDelete" #footer>
      <div class="items-end flex flex-col">
        <ConfirmButton
          :disabled="false"
          icon="pi pi-trash"
          :initial-label="t('common.delete')"
          type="submit"
          @confirm="deleteMutation"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
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
import ConfirmButton from '@/components/ConfirmButton.vue';
import { useMutationDetails } from '@/composables/mutationDetails';

const props = defineProps<{ type: FinancialMutationType; id: number }>();

const { isLoading, transaction, transfer, products, canDelete } = useMutationDetails(
  toRef(props, 'type'),
  toRef(props, 'id'),
);

const { t } = useI18n();

const emit = defineEmits(['update:visible']);
const visible = ref<boolean>(false);
const dialog = ref();
const toast = useToast();

const isType = (t: string) => computed(() => detailType.value === t);
const detailType = computed(() => {
  if (!transfer.value && props.type !== FinancialMutationType.TRANSACTION) return null;
  switch (props.type) {
    case FinancialMutationType.INVOICE:
      return 'invoice';
    case FinancialMutationType.DEPOSIT:
      return 'deposit';
    case FinancialMutationType.PAYOUT_REQUEST:
      return 'payoutRequest';
    case FinancialMutationType.FINE:
      return 'fine';
    case FinancialMutationType.WAIVED_FINE:
      return 'waivedFine';
    case FinancialMutationType.TRANSACTION:
      return transaction.value ? 'transaction' : null;
    default:
      return null;
  }
});

const deleteMutation = async () => {
  // Only allow deleting when permitted
  if (!canDelete.value) return;

  try {
    if (props.type === FinancialMutationType.FINE && transfer.value?.fine) {
      // await apiService.debtor.deleteFine(transfer.value.fine.id);
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.fineDeleted'),
        severity: 'success',
        life: 3000,
      });
      emit('update:visible', false);
    } else if (props.type === FinancialMutationType.TRANSACTION && transaction.value) {
      await apiService.transaction.deleteTransaction(transaction.value.id);
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.transactionDeleted'),
        severity: 'success',
        life: 3000,
      });
    } else {
      await router.replace({ path: '/error' });
      return;
    }
    emit('update:visible', false);
  } catch (err) {
    handleError(err, toast);
  }
};
</script>

<style scoped lang="scss"></style>
