<template>
  <div>
    <div class="flex flex-column gap-2">
      <div class="flex flex-column">
        <span><strong>{{ $t('PayoutID') }}:</strong> SDS-SP-{{ payout?.id }}</span>
        <span>
          <strong>{{ $t('Dates') }}:</strong>
          {{ formatDateFromString(payout?.startDate) }} till {{ formatDateFromString(payout?.endDate) }}
        </span>
        <span><strong>{{ $t('Amount') }}:</strong> {{ formatPrice(payout?.amount) }}</span>
        <span><strong>{{ $t('Description') }}:</strong> {{ payout?.reference }}</span>
      </div>
      <div class="flex flex-row gap-2 justify-content-between w-full mt-3">
        <div>
          <Button
              type="button"
              icon="pi pi-trash"
              :label="$t('common.delete')"
              severity="danger"
              @click="deletePayout"
          />
        </div>
        <div class="flex flex-row gap-2 justify-content-end w-full">
          <Button
              :label="verifyButtonLabel"
              :icon="verifyButtonIcon"
              :class="verifyButtonClass"
              :severity="verifyButtonSeverity"
              @click="verifyPayout(payout?.id)"
              :loading="verifying"
          />
          <Button
              type="button"
              icon="pi pi-file-export"
              :disabled="downloadingPdf"
              severity="danger"
              :label="$t('common.download PDF')"
              @click="() => downloadPdf(payoutId)"
          />
          <Button
              severity="secondary"
              :label="$t('common.close')"
              icon="pi pi-times"
              @click="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import { useSellerPayoutStore } from '@/stores/seller-payout.store';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import type { SellerPayoutResponse } from '@sudosos/sudosos-client';
import ApiService from "@/services/ApiService";

const { t } = useI18n();
const toast = useToast();
const sellerPayoutStore = useSellerPayoutStore();

const emits = defineEmits(['close', 'payout:approved', 'payout:denied']);

const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  },
});

const payout: ComputedRef<SellerPayoutResponse | null> = computed(() =>
    sellerPayoutStore.getPayout(props.payoutId)
);

const loading = ref<boolean>(true);
const downloadingPdf = ref<boolean>(false);
const verifying = ref<boolean>(false);
const verifySuccess = ref<boolean | null>(null);

const closeModal = () => {
  emits('close');
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  // const result = await payoutStore.fetchPdf(id);
  // window.location.href = getPayoutPdfSrc(result);
  downloadingPdf.value = false;
};

const verifyPayout = async (id: number) => {
  if (!id) return;

  verifying.value = true;
  verifySuccess.value = null;

  try {
    // Simulate an API call for verification
    console.error(payout.value);
    const startDate = new Date(payout.value.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(payout.value.endDate);
    endDate.setUTCHours(23, 59, 59, 999);
    const result = await ApiService.user.getUsersSalesReport(payout.value?.requestedBy.id, startDate.toISOString(), endDate.toISOString());
    if (result.data.totalInclVat.amount === payout.value.amount.amount) {
      verifySuccess.value = true;
      toast.add({ severity: 'success', summary: 'Verification Success', detail: 'Payout is verified.', life: 3000 });
    } else {
      verifySuccess.value = false;
      toast.add({ severity: 'error', summary: 'Verification Failed', detail: `Payout amount does not match the amount of purchases. ${formatPrice(result.data.totalInclVat)} vs. ${formatPrice(payout.value.amount)}`, life: 3000 });
    }
  } catch (error) {
    verifySuccess.value = false;
    toast.add({ severity: 'error', summary: 'Verification Failed', detail: 'Unable to verify the payout.', life: 3000 });
  } finally {
    verifying.value = false;
  }
};

const verifyButtonLabel = computed(() => {
  if (verifying.value) return '';
  return verifySuccess.value === true ? t('common.verified') : verifySuccess.value === false ? t('common.failed') : t('common.verify');
});

const verifyButtonIcon = computed(() => {
  if (verifying.value) return 'pi pi-spin pi-spinner';
  return verifySuccess.value === true ? 'pi pi-check' : verifySuccess.value === false ? 'pi pi-times' : 'pi pi-check';
});

const verifyButtonSeverity = computed(() => {
  return verifySuccess.value === true ? 'success' : verifySuccess.value === false ? 'danger' : 'info';
});

const verifyButtonClass = computed(() => {
  return verifySuccess.value === false ? 'p-button-danger' : verifySuccess.value === true ? 'p-button-success' : 'p-button-info';
});
</script>

<style scoped lang="scss">
</style>
