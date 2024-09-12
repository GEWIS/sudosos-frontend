<template>
  <div class="w-full">
    <div class="flex flex-column gap-2">
      <div class="flex flex-column" v-if="payout">
        <span><strong>{{ `${t('modules.seller.payouts.payout.id')}:` }}</strong> {{ `SDS-SP-${payout.id}` }}</span>
        <span>
          <strong>{{ `${t('modules.seller.payouts.payout.dates')}:` }}</strong>
          {{ `${formatDateFromString(payout?.startDate)} ${t('common.till')} ${formatDateFromString(payout.endDate)}` }}
        </span>
        <span><strong>{{ `${t('modules.seller.payouts.payout.amount')}:` }}
          </strong> {{ formatPrice(payout.amount) }}</span>
        <span><strong>{{ `${t('modules.seller.payouts.payout.description')}:` }}</strong> {{ payout.reference }}</span>
      </div>

      <div class="flex flex-row gap-2 justify-content-between w-full mt-3">
        <div>
          <Button
              type="button"
              icon="pi pi-trash"
              :label="t('common.delete')"
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
              @click="verifyPayout(payout)"
              :loading="verifying"
          />
          <Button
              type="button"
              icon="pi pi-file-export"
              :disabled="downloadingPdf"
              severity="danger"
              :label="t('common.downloadPdf')"
              @click="() => downloadPdf(payoutId)"
          />
          <Button
              severity="secondary"
              :label="t('common.close')"
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
import { verifyPayoutMixin } from "@/mixins/verifyPayoutMixin";
import { getSellerPayoutPdfSrc } from "@/utils/urlUtils";
import { handleError } from "@/utils/errorUtils";
import ApiService from "@/services/ApiService";


const {
  verifyPayout, verifying, verifyButtonLabel, verifyButtonIcon,
  verifyButtonClass, verifyButtonSeverity
} = verifyPayoutMixin.setup();
const { t } = useI18n();
const toast = useToast();
const sellerPayoutStore = useSellerPayoutStore();

const emits = defineEmits(['close', 'payout:approved', 'payout:denied', 'payout:deleted']);

const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  },
});

const payout: ComputedRef<SellerPayoutResponse | undefined> = computed(() =>
    sellerPayoutStore.getPayout(props.payoutId)
);

const downloadingPdf = ref<boolean>(false);

const closeModal = () => {
  emits('close');
};

const deletePayout = async () => {
  const result = await sellerPayoutStore.deletePayout(props.payoutId);
  if (result) {
    toast.add({
      severity: 'success', summary: t('common.success'),
      detail: t('modules.seller.payouts.payout.deleted')
    });
    emits('payout:deleted');
  } else {
    toast.add({
      severity: 'error', summary: t('common.error'),
      detail: t('modules.seller.payouts.payout.deleteError')
    });
  }
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  await ApiService.sellerPayouts.getSellerPayoutReportPdf(id).then((res) => {
    if (res.data.pdf) window.location.href = getSellerPayoutPdfSrc(res.data.pdf);
  }).catch((err) => {
    handleError(err, toast);
  }).finally(() => {
    downloadingPdf.value = false;
  });
};

</script>

<style scoped lang="scss">
</style>
