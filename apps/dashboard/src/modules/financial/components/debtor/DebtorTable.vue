<template>
  <CardComponent :header="t('modules.financial.debtor.debtorUsers.header')" class="w-full">
    <DataTable :value="debtorRows" tableStyle="min-width: 50rem"
               removableSort
               filterDisplay="row"
               @sort="onSortClick"
               striped-rows
               v-model:selection="selectedUsers">
      <Column selectionMode="multiple" style="width: 2%" v-if="isEditable">
      </Column>

      <Column field="gewisId" header="Id" style="width: 5%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
      </Column>

      <Column field="name" header="Name" :sortable="true" style="width: 15%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
        <template #body="{ data }" v-else>
          <RouterLink class="text-color" :to="`/user/${data.id}`" target="_blank">{{ data.name }}</RouterLink>
        </template>
        <template #filter>
          <InputText v-model="nameFilter" type="text" class="p-column-filter" placeholder="Search" />
        </template>
      </Column>

      <Column v-if="isEditable" field="secondaryBalance" filter-match-mode="notEquals"
              :header="controlBalanceHeader" :sortable="true" :showFilterMenu="false" style="width: 15%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
        <template #body="{ data }" v-else>
          {{ data.secondaryBalance }}
        </template>
        <template #filter v-if="isEditable">
          <Calendar
              v-model="controlBalanceDate"
              id="firstDate"
              showTime
              hourFormat="24"
              placeholder="Click to change date"
          />
        </template>
      </Column>

      <Column field="primaryBalance" filter-match-mode="notEquals"
              :header="referenceBalanceHeader" :sortable="true" :showFilterMenu="false" style="width: 15%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
        <template #body="{ data }" v-else>
          {{ data.primaryBalance }}
        </template>
        <template #filter v-if="isEditable">
          <Calendar
              v-model="referenceBalanceDate"
              id="firstDate"
              showTime
              hourFormat="24"
              placeholder="Click to change date"
          />
        </template>
      </Column>

      <Column field="primaryBalanceFine" header="of which fine" :sortable="true" style="width: 10%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
      </Column>

      <Column field="fine" :header="fineHeader" :sortable="true" style="width: 10%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
      </Column>

      <Column field="fineSince" header="Fine since" :sortable="true" style="width: 10%">
        <template #body v-if="debtorStore.isDebtorsLoading">
          <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>
              <span v-if="slotProps.data.fineSince" class="text-red-500 font-bold">
                {{ formatFineTimeSince(new Date(slotProps.data.fineSince), referenceBalanceDate || new Date()) }}
              </span>
        </template>
      </Column>

    </DataTable>
    <Divider />
    <div>
      <table>
        <tr>
          <td>Total users:</td>
          <td>{{ debtorStore.debtors.length }}</td>
        </tr>
        <tr>
          <td>Total debt of users:</td>
          <td>{{ formatPrice(debtorStore.totalDebt) }}</td>
        </tr>
        <tr>
          <td>Total fines to be handed out:</td>
          <td>{{ formatPrice(debtorStore.totalFine) }}</td>
        </tr>
      </table>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import CardComponent from "@/components/CardComponent.vue";
import { useDebtorStore, SortField } from "@/stores/debtor.store";
import { computed, type ComputedRef, onMounted, ref, watch } from "vue";
import Calendar from "primevue/calendar";
import Column from "primevue/column";
import { formatPrice, formatFineTimeSince } from "@/utils/formatterUtils";
import DataTable, { type DataTableSortEvent } from "primevue/datatable";
import Skeleton from "primevue/skeleton";
import { debounce } from "lodash";
import { RouterLink } from "vue-router";
import type { FineHandoutEventResponse } from "@sudosos/sudosos-client";

const props = defineProps<{
  handoutEvent?: FineHandoutEventResponse;
}>();

const isEditable = computed(() => {
  return props.handoutEvent == undefined;
});

const { t } = useI18n();

const debtorStore = useDebtorStore();

// All the users that have been selected for actions
const selectedUsers = ref();

// Primary balance
const referenceBalanceDate = ref<Date | undefined>(
    isEditable.value
        ? undefined
        : new Date(props.handoutEvent!.referenceDate)
);
const referenceBalanceHeader = computed(() => {
  if (!isEditable.value) return "Balance on " + referenceBalanceDate.value!.toLocaleString('nl', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  if(referenceBalanceDate.value == undefined) {
    return "Current balance (target)";
  } else {
    return "Balance on " + referenceBalanceDate.value.toLocaleString('nl', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + " (target)";
  }
});

// Current balance
const controlBalanceDate = ref<Date>();
const controlBalanceHeader = computed(() => {
  if(controlBalanceDate.value == undefined) {
    return "Current balance (control)";
  } else {
    return "Balance on " + controlBalanceDate.value.toLocaleString('nl', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + " (control)";
  }
});

// Fetch new calculated fines based on the dates
watch([ referenceBalanceDate, controlBalanceDate ], updateCalculatedFines);
async function updateCalculatedFines() {
  selectedUsers.value = [];
  await debtorStore.fetchCalculatedFines(
      referenceBalanceDate.value || new Date(),
      controlBalanceDate.value || new Date(),
      props.handoutEvent?.fines.map(f => f.user.id));
}

const fineHeader = computed(() => {
  if (isEditable.value) {
    return "To be fined";
  } else {
    return "Was fined";
  }
});

const nameFilter = ref<string>("");

watch(nameFilter, debounce(() => {
  console.log(2);
  debtorStore.filter = {
    name: nameFilter.value
  };
}, 50));

const onSortClick = (sort: DataTableSortEvent) => {
  if (sort.sortField == SortField.SECONDARY_BALANCE
      && controlBalanceDate.value == undefined) {
    return;
  }

  debtorStore.sort = {
    field: sort.sortField as SortField || null,
    direction: sort.sortOrder || null
  };
};



// Row in the datatable
interface DebtorRow {
  id: number,
  gewisId: number | undefined;
  name: string;
  primaryBalance: string;
  secondaryBalance: string;
  primaryBalanceFine: string;
  fine?: string;
}

// Convert data from the store to something that can be displayed by the datatable
const debtorRows: ComputedRef<DebtorRow[]> = computed(() => {
  if (debtorStore.isDebtorsLoading) {
    return new Array(10);
  }

  const debtorRowsArr = [];

  for (const debtor of debtorStore.debtors) {

    // Skip if we are viewing a handoutEvent but user is not in that handout
    if (props.handoutEvent
        && !props.handoutEvent.fines.map(f => f.user.id).includes(debtor.user.id)) {
      continue;
    }

    // Take fine from handout event if present
    let fine;
    if (props.handoutEvent) {
      fine = formatPrice(
          props.handoutEvent.fines.find(f => f.user.id === debtor.user.id)!.amount
      );
    } else {
      fine = debtor.fine.fineAmount && formatPrice(
          debtor.fine.fineAmount
      );
    }

    debtorRowsArr.push({
      id: debtor.user.id,
      gewisId: debtor.user.gewisId,
      name: debtor.user.firstName + " " + debtor.user.lastName,
      primaryBalance: formatPrice(debtor.fine.balances[0].amount),
      secondaryBalance: debtor.fine.balances[1] && formatPrice(debtor.fine.balances[1].amount),
      primaryBalanceFine: debtor.fine.balances[0].fine && formatPrice(debtor.fine.balances[0].fine),
      fine: fine,
      fineSince: debtor.fine.balances[0].fineSince
    });
  }

  return debtorRowsArr;
});

onMounted(() => {
  updateCalculatedFines();
});
</script>


<style scoped lang="scss">

</style>