<template>
    <DataTable :rows="rows" :value="mutations" :rowsPerPageOptions="[5, 10, 25, 50, 100]" :paginator="paginator" lazy
        @page="onPage($event)" :totalRecords="totalRecords" >
        <Column field="moment" :header="$t('transactions.when')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <span class="hidden sm:block">{{ mutation.data.moment.toLocaleDateString($i18n.locale, {
                    dateStyle: 'full'
                    }) }}</span>
                <span class="sm:hidden">{{
                    mutation.data.moment.toLocaleDateString('nl-NL', {
                    dateStyle: 'short'
                    })
                    }}
                </span>
            </template>
        </Column>

        <Column field="mutationDescription" :header="$t('transactions.what')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                {{ getDescription(mutation.data) }}
            </template>
        </Column>

        <Column field="mutationPOS" class="hidden sm:block" :header="$t('transactions.pos')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                {{ mutation.data.pos }}
            </template>
        </Column>

        <Column field="change" :header="$t('transactions.amount')">
            <template #body v-if="isLoading">
                <Skeleton class="w-3 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <div v-if="
              mutation.data.type == FinancialMutationType.DEPOSIT ||
              mutation.data.type == FinancialMutationType.INVOICE ||
              mutation.data.type == FinancialMutationType.WAIVED_FINE
            " style="color: #198754" class="font-bold">
                    {{ formatPrice((mutation.data as FinancialMutation).amount) }}
                </div>

                <div v-else-if="mutation.data.type == FinancialMutationType.FINE" style="color: #d40000"
                    class="font-bold">
                    {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
                </div>

                <div v-else severity="info">
                    {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
                </div>
            </template>
        </Column>

        <Column field="" style="width: 10%">
            <template #body v-if="isLoading">
                <Skeleton class="w-3 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <i class="pi pi-info-circle cursor-pointer"
                    @click="() => openModal(mutation.data.id, mutation.data.type)" />
            </template>
        </Column>
    </DataTable>
    <ModalMutation
        v-if="openedMutationId && openedMutationType"
        v-model:visible="isModalVisible"
        :id="openedMutationId"
        :type="openedMutationType"
    />
</template>
<script lang="ts" setup>
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from "vue";
import { formatPrice } from '@/utils/formatterUtils';
import {
    type FinancialMutation,
    FinancialMutationType,
    parseFinancialMutations,
    getDescription
} from "@/utils/mutationUtils";
import CardComponent from "@/components/CardComponent.vue";
import ModalMutation from "@/components/mutations/mutationmodal/ModalMutation.vue";

const props = defineProps({
    paginator: {
      type: Boolean,
      required: true
    },
    getMutations: {
        type: Function,
        required: true
    },
    rowsAmount: {
      type: Number,
      required: false
    }
});

const mutations = ref<FinancialMutation[]>(new Array(10));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);

const rows: Ref<number> = ref(props.rowsAmount || 10);
onMounted(async () => {
  const initialMutations = await props.getMutations(rows.value, 0);
  mutations.value = parseFinancialMutations(initialMutations);
  totalRecords.value = initialMutations._pagination.count || 0;
  isLoading.value = false;
});

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await props.getMutations(event.rows, event.first);
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