<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="rowValues"
        :rows-per-page-options="[12, 24, 48, 96, 120]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :total-records="totalRecords"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
    >
      <Column field="startDate" :header="$t('seller.Start date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.startDate) }}</span>
        </template>
      </Column>
      <Column field="endDate" :header="$t('seller.End date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.endDate) }}</span>
        </template>
      </Column>
      <Column field="reference" :header="$t('seller.Reference')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.reference }}</span>
        </template>
      </Column>
      <Column field="amount" :header="$t('transactions.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column :header="$t('payout.Actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else class="flex flex-row align-items-center">
            <Button
                type="button"
                icon="pi pi-eye"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => viewPayout(slotProps.data.id)"
            />
            <Button
                v-tooltip.top="$t('payout.Download PDF')"
                type="button"
                icon="pi pi-file-export"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => downloadPdf(slotProps.data.id)"
                v-if="!downloadingPdf"
            />
            <Skeleton v-else class="w-3 my-1 h-2rem surface-300" />
          </span>
        </template>
      </Column>
    </DataTable>
    <Dialog
        modal
        ref="dialog"
        @show="addListenerOnDialogueOverlay(dialog)"
        v-model:visible="showModal"
        :draggable="false"
        class="w-auto flex w-9 md:w-4"
        :header="$t('seller.Payout details')">
      <SellerPayoutInfo :payoutId="payoutId" @close="showModal = false"/>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType, type Ref, computed } from "vue";
import { formatPrice, formatDateFromString } from "@/utils/formatterUtils";
import {
  type PaginatedSellerPayoutResponse,
  type UserResponse
} from "@sudosos/sudosos-client";
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Button from "primevue/button";
import ApiService from "@/services/ApiService";
import { useRouter } from "vue-router";
import { getSellerPayoutPdfSrc } from "@/utils/urlUtils";
import SellerPayoutInfo from "@/modules/seller/components/seller/SellerPayoutInfo.vue";
import { useSellerPayoutStore } from "@/stores/seller-payout.store";

const router = useRouter();
const sellerPayoutStore = useSellerPayoutStore();

const props = defineProps({
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  }
});

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const rows = ref<number>(12);
const paginator = ref<boolean>(true);

const payouts = ref();
const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return payouts.value;
});

const showModal: Ref<boolean> = ref(false);
const dialog = ref();
const payoutId: Ref<number> = ref(0);
const downloadingPdf = ref<boolean>(false);

const viewPayout = async (id: number) => {
  showModal.value = true;
  payoutId.value = id;
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  const result = await ApiService.sellerPayouts.getSingleSellerPayoutPdf(id);
  window.location.href = getSellerPayoutPdfSrc(result);
  downloadingPdf.value = false;
};

onMounted(async () => {
  await loadPayoutRequests();
});

async function loadPayoutRequests(skip = 0) {
  isLoading.value = true;
  const response: PaginatedSellerPayoutResponse = await sellerPayoutStore.fetchPayoutsBy(props.seller.id, 12, skip).catch(async () => {
    await router.replace('/error');
    return;
  });
  if (response) {
    payouts.value = response.records;
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  await loadPayoutRequests(event.first);
}

// watch(() => payoutStore.getUpdatedAt, () => {
//   loadPayoutRequests();
// });
</script>

<style scoped lang="scss">
</style>
