<template>
  <DataTable
    lazy
    :paginator="paginator"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50, 100]"
    :total-records="totalRecords"
    :value="mutations"
    @page="onPage($event)"
  >
    <Column field="moment" :header="t('components.mutations.when')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        <span class="hidden sm:block">{{
          mutation.data.moment.toLocaleDateString(locale, {
            dateStyle: 'full',
          })
        }}</span>
        <span class="sm:hidden"
          >{{
            mutation.data.moment.toLocaleDateString('nl-NL', {
              dateStyle: 'short',
            })
          }}
        </span>
      </template>
    </Column>

    <Column field="createdBy" :header="t('components.mutations.createdBy')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        {{ mutation.data.createdBy?.firstName + ' ' + mutation.data.createdBy?.lastName }}
      </template>
    </Column>

    <Column field="createdFor" :header="t('components.mutations.createdFor')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        {{ mutation.data.from?.firstName + ' ' + mutation.data.from?.lastName }}
      </template>
    </Column>

    <Column field="change" :header="t('components.mutations.amount')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <!-- Deposits, Invoices, Waived fines all get green -->
        <div v-if="isIncreasingTransfer(mutation.data.type)" class="font-bold" style="color: #198754">
          {{ formatPrice((mutation.data as FinancialMutation).amount) }}
        </div>

        <!-- Fines get green -->
        <div v-else-if="isFine(mutation.data.type)" class="font-bold" style="color: #d40000">
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>

        <!-- Other transactions stay black -->
        <div v-else>
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>
      </template>
    </Column>

    <Column field="" style="width: 10%">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <i class="cursor-pointer pi pi-info-circle" @click="() => openModal(mutation.data.id, mutation.data.type)" />
      </template>
    </Column>
  </DataTable>
  <ModalMutation
    v-if="openedMutationId && openedMutationType"
    :id="openedMutationId"
    v-model:visible="isModalVisible"
    :type="openedMutationType"
  />
</template>
<script lang="ts" setup>
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from 'vue';
import { type PaginatedBaseTransactionResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import {
  type FinancialMutation,
  FinancialMutationType,
  parseFinancialMutations,
  isIncreasingTransfer,
  isFine,
} from '@/utils/mutationUtils';
import ModalMutation from '@/components/mutations/mutationmodal/ModalMutation.vue';

const { t, locale } = useI18n();

const props = defineProps<{
  getMutations: (take: number, skip: number) => Promise<PaginatedBaseTransactionResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
}>();

const mutations = ref<FinancialMutation[]>(new Array(10));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);

const rows: Ref<number> = ref(props.rowsAmount || 10);
onMounted(async () => {
  const initialMutations = await props.getMutations(rows.value, 0);
  if (!initialMutations) return;
  mutations.value = parseFinancialMutations(initialMutations);
  totalRecords.value = initialMutations._pagination.count || 0;
  isLoading.value = false;
});

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await props.getMutations(event.rows, event.first);
  if (!newTransactions) {
    isLoading.value = true;
    return;
  }
  mutations.value = parseFinancialMutations(newTransactions);
}

const openedMutationId = ref<number>();
const openedMutationType = ref<FinancialMutationType>();
const isModalVisible = ref<boolean>(false);

function openModal(id: number, type: FinancialMutationType) {
  openedMutationId.value = id;
  openedMutationType.value = type;
  isModalVisible.value = true;
}
</script>
<style lang="scss" scoped></style>
