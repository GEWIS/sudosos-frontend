<template>
  <div class="flex flex-column gap-3">
    <InputUserSpan :label="t('modules.financial.invoice.for')"
                   :type="GetAllUsersTypeEnum.Invoice"
                   :value="selectedUser"
                   @update:value="selectedUser = $event"
    />

    <div v-if="userBalance" class="flex flex-row gap-1">
      <span>
        {{ t('modules.financial.forms.payout.currentBalance', { balance: formatPrice(userBalance.amount) }) }}</span>
    </div>

    <span>Total selected {{ formatPrice({ amount: transactionTotal }) }}</span>

    <span v-if="userBalance">Balance after invoice {{ formatPrice({ amount: userBalance.amount.amount + transactionTotal }) }}</span>

    <Calendar v-model="dates" inline showButtonBar :disabled="isLoading || loadingHeatmap" :key="transactionCalendar" selectionMode="range" :manualInput="true" :pt='{
      day: (options) => {
        const dateString = `${options.context.date.year}-${options.context.date.month}-${options.context.date.day}`;
        if (transactionsPerDay[dateString]) {
          return {
            class: "transaction-day-selected",
          }
        }
      }
    }' @month-change="monthChange($event)"/>

    Points of Sale included with invoice:
    <span class="font-bold">{{ Object.values(includedPOS).map(p => `${p.name} (id ${p.id})`).join(", ") }}</span>
<!--    <DataTable :value="transactions" class="w-full">-->
<!--      <Column field="createdAt" :header="t('components.mutations.when')">-->
<!--        <template #body v-if="isLoading">-->
<!--          <Skeleton class="w-3 my-1 h-1rem surface-300"/>-->
<!--        </template>-->
<!--        <template #body="transaction" v-else>-->
<!--          {{ dateString(transaction.data) }}-->
<!--        </template>-->
<!--      </Column>-->
<!--      <Column field="pointOfSale" :header="t('components.mutations.pos')">-->
<!--        <template #body v-if="isLoading">-->
<!--          <Skeleton class="w-3 my-1 h-1rem surface-300"/>-->
<!--        </template>-->
<!--        <template #body="transaction" v-else>-->
<!--          {{ transaction.data.pointOfSale.name }}-->
<!--        </template>-->
<!--      </Column>-->
<!--      <Column field="totalPriceInclVat" :header="t('components.mutations.amount')">-->
<!--        <template #body v-if="isLoading">-->
<!--          <Skeleton class="w-3 my-1 h-1rem surface-300"/>-->
<!--        </template>-->
<!--        <template #body="transaction" v-else>-->
<!--          <div>-->
<!--            {{ formatPrice(transaction.data.totalPriceInclVat, true) }}-->
<!--          </div>-->
<!--        </template>-->
<!--      </Column>-->
<!--    </DataTable>-->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { createInvoiceObject } from "@/utils/validation-schema";
import { computed, type PropType, reactive, type Ref, ref, watch } from "vue";
import * as yup from "yup";
import type { Form } from "@/utils/formUtils";
import InputUserSpan from "@/components/InputUserSpan.vue";
import { type BalanceResponse, type BaseTransactionResponse, GetAllUsersTypeEnum } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";
import { formatPrice } from "sudosos-dashboard/src/utils/formatterUtils";

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const dates = ref<(Date|null)[]>([]);
const selectedUser = ref();
const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);
const transactions: Ref<BaseTransactionResponse[]>= ref();
const transactionCalendar = ref(0);
const transactionTotal = ref(0);
const includedPOS = ref({});

const isLoading: Ref<boolean> = ref(false);

const getTransactions = () => {
  isLoading.value = true;
  const fromDate = new Date(dates.value[0]);
  const toDate = new Date(dates.value[1]);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);
  transactionTotal.value = 0;
  apiService.invoices.getEligibleTransactions(selectedUser.value.id, fromDate.toISOString(), toDate.toISOString()).then((res) => {
    transactions.value = res.data;
    includedPOS.value = {};
    res.data.forEach((transaction: BaseTransactionResponse) => {
      console.error(transaction);
      transactionTotal.value += transaction.totalPriceInclVat.amount;
      includedPOS.value[transaction.pointOfSale.id] = transaction.pointOfSale;
    });
    console.error(res.data);
  }).finally(() => {
    isLoading.value = false;
  });
};

const isShowing = computed(() => {
  return showTransactions();
});
const showTransactions = () => {
  if (!dates.value || dates.value.length !== 2) return false;
  return selectedUser.value !== undefined && dates.value[0] !== null && dates.value[1] !== null;
};

watch(selectedUser, () => {
  if (selectedUser.value) {
    const now = new Date();
    getTransactionsHeatMap({ month: now.getMonth() + 1, year: now.getFullYear() });
    apiService.balance.getBalanceId(selectedUser.value.id).then((res) => {
      userBalance.value = res.data;
    }).catch(() => {
      userBalance.value = undefined;
    });
  }
  if (showTransactions()) getTransactions();
  else transactions.value = [];
});

watch(dates, () => {
  if (showTransactions()) getTransactions();
  else transactions.value = [];
});

const dateString = (transaction: BaseTransactionResponse) => {
  return new Date(transaction.createdAt!!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

// Mapping between the date and the transactions
const transactionsPerDay = reactive<{ [key: string]: boolean }>({});
const loadingHeatmap = ref(false);

const getTransactionsHeatMap = (event: { month: number, year: number }) => {
  loadingHeatmap.value = true;
  const fromDate = new Date(event.year, event.month-1, 1);
  const toDate = new Date(event.year, event.month, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  // console.error("LOADING", fromDate, toDate);
  apiService.invoices.getEligibleTransactions(selectedUser.value.id,
      fromDate.toISOString(), toDate.toISOString()).then((res) => {
        res.data.forEach((transaction: BaseTransactionResponse) => {
          const date = new Date(transaction.createdAt);
          const dateKey = `${date.getFullYear()}-${date.getUTCMonth()}-${date.getDate()}`;
          // console.error(dateKey);
          transactionsPerDay[dateKey] = true;
        });
  }).finally(() => {
    loadingHeatmap.value = false;
  });
};

const monthChange = (event: { month: number, year: number }) => {
  console.error(event);
  getTransactionsHeatMap(event);
};

</script>

<style lang="scss">
    .p-datepicker table td.transaction-day-selected > span {
      background-color: rgba(11, 114, 0, 0.89) !important;
      color: white !important;
      font-weight: bold;
    }
</style>
