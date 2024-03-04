<template>
  <CardComponent :action="action" :header="header" :router-link="routerLink" class="w-full">
    <DataTable
        :rows=rows
        :value="mutations"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :totalRecords="totalRecords"
        >

      <Column field="moment" style="width: 25%" :header="$t('transactions.when')">
        <template #body="mutation">
          {{ mutation.data.moment.toDateString() }}
        </template>
      </Column>

      <Column field="mutationDescription" style="width: 25%" :header="$t('transactions.what')">
        <template #body="mutation">
          {{ 
            getDescription(mutation.data)
          }}
        </template>  
      
      </Column>

      <Column field="change" style="width: 40%" :header="$t('transactions.amount')">
        <template #body="mutation">
          <div 
            v-if="mutation.data.to && mutation.data.to.id == user.id" 
            style="
              min-width: 9rem;
              justify-content: start;
              color: #198754;
            "
            class="font-bold"
            >
            {{ formatPrice((mutation.data as FinancialMutation).amount) }}
          </div>

          <div 
            v-else-if="mutation.data.type == 3" 
            style="
              min-width: 9rem;
              justify-content: start;
              color: #D40000;
            "
            class="font-bold"
            >
            <!-- <template #icon>
              <i class="pi p-inline-message-icon pi-exclamation-triangle"></i>
            </template> -->
            {{ formatPriceAsNegative((mutation.data as FinancialMutation).amount) }}
          </div>

          <div 
            v-else 
            severity="info"
            style="
              min-width: 9rem;
              justify-content: start;
            "
            
            >
              {{ formatPriceAsNegative((mutation.data as FinancialMutation).amount) }}
        </div>
        </template>  
      </Column>

      <Column field="">
        <template #body="mutation">
            <i 
              class="pi pi-info-circle cursor-pointer"
              @click="() => openModal(mutation.data.id, mutation.data.type)"
            />
        </template>
      </Column>

    </DataTable>
  </CardComponent>
  <MutationModal
    :type="selectedMutationType"
    :id="selectedMutationId"
    v-model:visible="mutationShow"
    :draggable="false"
  />
</template>


<script lang="ts" setup>
import DataTable from "primevue/datatable";
import type { DataTablePageEvent } from "primevue/datatable";
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InlineMessage from 'primevue/inlinemessage';
import CardComponent from "@/components/CardComponent.vue";
import type {
  BaseTransactionResponse,
  FinancialMutationResponse, PaginatedBaseTransactionResponse,
  PaginatedFinancialMutationResponse,
  TransferResponse
} from "@sudosos/sudosos-client";
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import MutationModal from "@/components/Mutations/MutationModal.vue";
import {
  parseFinancialTransactions,
  parseTransaction,
  parseTransfer,
  type FinancialMutation,
  FinancialMutationType
} from "@/utils/mutationUtils";
import { formatPrice, formatPriceAsNegative } from "@/utils/formatterUtils";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import "primeicons/primeicons.css"

const user = useUserStore().getCurrentUser.user!!

const props = defineProps({
  action: {
    type: String,
    required: false,
  },
  header: {
    type: String,
    required: true,
  },
  routerLink: {
    type: String,
    required: false,
  },
  paginator: {
    type: Boolean,
    required: true,
  },
  modal: {
    type: Boolean,
    required: true,
  },
  callbackFunction: {
    type: Function,
    required: true,
  }
});

const mutations = ref<FinancialMutation[]>();
const selectedMutationId = ref<number>(-1); // TODO: Handle the case when this is not changed
const selectedMutationType = ref<FinancialMutationType>(FinancialMutationType.TRANSACTION); // TODO: Handle the case when this is not changed
const mutationShow = ref<boolean>(false);
const totalRecords = ref<number>(0);


const rows: Ref<number> = ref(10);
onMounted( async () => {
  const initialMutations = await getMutations(rows.value, 0);
  mutations.value = parseFinancialMutations(initialMutations);
  totalRecords.value = initialMutations._pagination.count || 0
});

function isPaginatedBaseTransactionResponse(obj: any): obj is PaginatedBaseTransactionResponse {
  return obj.records && obj.records.length > 0 && 'id' in obj.records[0];
}

function parseFinancialMutations(mutations: PaginatedFinancialMutationResponse | PaginatedBaseTransactionResponse): FinancialMutation[] {
  let result: FinancialMutation[] = [];
  if(isPaginatedBaseTransactionResponse(mutations)) {
    mutations.records.forEach((mutation: BaseTransactionResponse) => {
      result.push(parseTransaction(mutation));
    });
  } else {
    mutations.records.forEach((mutation: FinancialMutationResponse) => {
      if (mutation.type === "transaction") {
        const transaction = mutation.mutation as BaseTransactionResponse;
        result.push(parseTransaction(transaction));
      } else if (mutation.type === "transfer") {
        const transfer = mutation.mutation as TransferResponse;
        result.push(parseTransfer(transfer));
      }
    });
  }
  return result;
}

function openModal(id: number, type: FinancialMutationType) {
  selectedMutationId.value = id;
  selectedMutationType.value = type;
  mutationShow.value = true;
}

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await getMutations(event.rows, event.first);
  mutations.value = isPaginatedBaseTransactionResponse(newTransactions) ?
    parseFinancialTransactions(newTransactions) : parseFinancialMutations(newTransactions);
}

async function getMutations(take: number, skip: number):
  Promise<PaginatedBaseTransactionResponse | PaginatedFinancialMutationResponse> {
  return await props.callbackFunction(take, skip);
}

function getDescription(mutation: FinancialMutation) {
  switch (mutation.type) {
    case FinancialMutationType.TRANSACTION: {
      return "Payment"
    }
    case FinancialMutationType.DEPOSIT: {
      return "Top up"
    }
    case FinancialMutationType.FINE: {
      return "Fine"
    }
    default: {
      return "Could not find"
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
