<template>
  <div v-if="payout">
    <div class="flex flex-column gap-2">
      <span>User: {{ payout.requestedBy.firstName }} {{ payout.requestedBy.lastName }}</span>

      <table class="table text-left my-1">
        <thead>
        <tr>
          <th>Bank Account Number</th>
          <th>Account Name</th>
          <th>Amount</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="!loading">
          <td>{{ payout.bankAccountNumber }}</td>
          <td>{{ payout.bankAccountName }}</td>
          <td>{{ formatPrice(payout.amount) }}</td>
        </tr>
        <tr v-else>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
          <td><Skeleton class="w-6 my-1 h-1rem surface-300"/></td>
        </tr>
        </tbody>
      </table>
      <div class="flex flex-column">
        <span>Created At: {{ formatDateFromString(payout.createdAt) }}</span>
        <span>Updated At: {{ formatDateFromString(payout.updatedAt) }}</span>
        <span>Payout ID: {{ payout.id }}</span>
      </div>
    </div>
    <div v-if="isApproved" class="mt-1">
      <span class="font-italic text-sm">This payout request has been approved by {{ payout.approvedBy.firstName }} {{ payout.approvedBy.lastName }}</span>
    </div>
    <div class="flex flex-row gap-2 justify-content-end w-full mt-3">
      <div v-if="!isApproved" class="flex flex-row gap-2">
        <Button
            severity="success"
            :label="$t('approve')"
            icon="pi pi-check"
            @click="approvePayout"
        />
        <Button
            severity="danger"
            :label="$t('deny')"
            icon="pi pi-times"
            @click="denyPayout"
        />
      </div>
      <Button
          type="button"
          icon="pi pi-file-export"
          :disabled="downloadingPdf"
          severity="danger"
          :label="$t('download PDF')"
          @click="() => downloadPdf(payoutId)"
          v-else
      />
      <Button
          severity="secondary"
          :label="$t('close')"
          icon="pi pi-times"
          @click="closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PayoutResponse, usePayoutStore } from "@/stores/payout.store";
import { computed, type ComputedRef, onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import { formatDateFromString, formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";
import {
  PayoutRequestStatusRequestStateEnum
} from "@sudosos/sudosos-client";
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import { isArray } from "lodash";
import { getPayoutPdfSrc } from "@/utils/urlUtils";

const toast = useToast();

const payoutStore = usePayoutStore();
const payout: ComputedRef<PayoutResponse | null> = computed(() => payoutStore.getPayout(props.payoutId));

const loading = ref<boolean>(true);
const downloadingPdf = ref<boolean>(false);
const isApproved = computed(() => {
  if (!payout.value) return false;
  if (!isArray(payout.value.status)) return payout.value.status === PayoutRequestStatusRequestStateEnum.Approved;
  return payout.value.status.map((s) => s.state).includes(PayoutRequestStatusRequestStateEnum.Approved);
});

const emits = defineEmits(['close', 'payout:approved', 'payout:denied']);

const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  }
});

onMounted(() => {
  loading.value = true;
  payoutStore.fetchPayout(props.payoutId).catch((err) => {
    handleError(err, toast);
  }).finally(() => {
    loading.value = false;
  });
});

const approvePayout = async () => {
  if (!payout.value) return;
  await payoutStore.approvePayout(payout.value.id).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Payout approved successfully.' });
    emits('payout:approved');
    emits('close');
  }).catch((err) => handleError(err, toast));
};

const denyPayout = async () => {
  if (!payout.value) return;
  await payoutStore.denyPayout(payout.value.id).then(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Payout denied successfully.' });
    emits('payout:denied');
    emits('close');
  }).catch((err) => handleError(err, toast));
};

const closeModal = () => {
  emits('close');
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  const result = await payoutStore.fetchPdf(id);
  window.location.href = getPayoutPdfSrc(result);
  downloadingPdf.value = false;
};

</script>

<style scoped lang="scss">
</style>
