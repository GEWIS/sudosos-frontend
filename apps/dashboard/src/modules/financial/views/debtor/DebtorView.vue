<template>
  <div class="page-container-wide flex flex-column">
    <div class="page-title">{{ t('modules.financial.debtor.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="t('modules.financial.debtor.debtorUsers.header')" class="w-full">
        <DataTable :value="debtorRows" tableStyle="min-width: 50rem"
                   removableSort lazy
                   filterDisplay="row"
                   @sort="onSortClick"
                   :totalRecords="debtorStore.userToFineResponse.length"
                   v-model:selection="selectedUsers">


          <Column selectionMode="multiple" style="width: 2%" >
          </Column>

          <Column field="id" header="Id" style="width: 5%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
          </Column>

          <Column field="name" header="Name" :sortable="true" style="width: 15%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
            <template #body="{ data }" v-else>
              {{ data.name }}
            </template>
            <template #filter>
              <InputText v-model="nameFilter" type="text" class="p-column-filter" placeholder="Search" />
            </template>
          </Column>

          <Column field="secondaryBalance" filter-match-mode="notEquals"
                  :header="secondaryBalanceHeader" :sortable="true" :showFilterMenu="false" style="width: 15%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
            <template #body="{ data }" v-else>
              {{ data.secondaryBalance }}
            </template>
            <template #filter>
              <Calendar
                  v-model="secondaryBalanceDate"
                  id="firstDate"
                  showTime
                  hourFormat="24"
                  placeholder="Click to change"
              />
            </template>
          </Column>

          <Column field="primaryBalance" filter-match-mode="notEquals"
                  :header="primaryBalanceHeader" :sortable="true" :showFilterMenu="false" style="width: 15%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
            <template #body="{ data }" v-else>
              {{ data.primaryBalance }}
            </template>
            <template #filter>
              <Calendar
                  v-model="primaryBalanceDate"
                  id="firstDate"
                  showTime
                  hourFormat="24"
                  placeholder="Click to change"
              />
            </template>
          </Column>

          <Column field="fine" header="Fine" :sortable="true" style="width: 20%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
          </Column>

          <Column field="fineSince" header="Fine since" :sortable="true" style="width: 20%">
            <template #body v-if="debtorStore.isLoading">
              <Skeleton class="w-6 mr-8 my-1 h-2rem surface-300"/>
            </template>
            <template #body="slotProps" v-else>
              <span v-if="slotProps.data.fineSince" class="text-red-500 font-bold">
                {{ formatTimeSince(new Date(slotProps.data.fineSince), new Date()) }}
              </span>
            </template>
          </Column>

        </DataTable>
      </CardComponent>
    </div>
  </div>
</template>
<!---
Ideas:

- Debounce on network request based actions
- Make the primary and secundairy dates clear
- Explaination
- New fine preview
- Summary stats
- Deal with waived fines

---->
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import CardComponent from "@/components/CardComponent.vue";
import { useDebtorStore, SortField } from "@/stores/debtor.store";
import { computed, type ComputedRef, onMounted, ref, watch } from "vue";
import Calendar from "primevue/calendar";
import Column from "primevue/column";
import { formatPrice, formatTimeSince } from "@/utils/formatterUtils";
import DataTable, { type DataTableSortEvent } from "primevue/datatable";
import Skeleton from "primevue/skeleton";
import { debounce } from "lodash";

const { t } = useI18n();

const debtorStore = useDebtorStore();

// All the users that have been selected for actions
const selectedUsers = ref();

// Primary balance
const primaryBalanceDate = ref<Date>();
const primaryBalanceHeader = computed(() => {
  if(primaryBalanceDate.value == undefined) {
    return "Primary balance now ";
  } else {
    return "Primary balance on " + primaryBalanceDate.value.toLocaleString('nl', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});

// Secondary balance
const secondaryBalanceDate = ref<Date>();
const secondaryBalanceHeader = computed(() => {
  if(secondaryBalanceDate.value == undefined) {
    return "Secondary balance --/--/--";
  } else {
    return "Secondary balance on " + secondaryBalanceDate.value.toLocaleString('nl', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
});

// Fetch new calculated fines based on the dates
watch(primaryBalanceDate, updateCalculatedFines);
watch(secondaryBalanceDate, updateCalculatedFines);
async function updateCalculatedFines() {
  selectedUsers.value = [];
  await debtorStore.fetchCalculatedFines(primaryBalanceDate.value || new Date(), secondaryBalanceDate.value);
}


const nameFilter = ref<string>("");

watch(nameFilter, debounce(() => {
    console.log(2);
    debtorStore.filter = {
      name: nameFilter.value
    };
  }, 50));

const onSortClick = (sort: DataTableSortEvent) => {
  if (sort.sortField == SortField.SECONDARY_BALANCE
        && secondaryBalanceDate.value == undefined) {
    return;
  }

  debtorStore.sort = {
    field: sort.sortField as SortField || null,
    direction: sort.sortOrder || null
  };
};



// Row in the datatable
interface DebtorRow {
  id: number;
  name: string;
  primaryBalance: string;
  secondaryBalance: string;
  fine?: string;
}

// Convert data from the store to something that can be displayed by the datatable
const debtorRows: ComputedRef<DebtorRow[]> = computed(() => {
  const debtorRowsArr = [];

  for (const debtorId in debtorStore.debtors) {
    const debtor = debtorStore.debtors[debtorId];
    debtorRowsArr.push({
      id: debtor.user.id,
      name: debtor.user.firstName + " " + debtor.user.lastName,
      primaryBalance: formatPrice(debtor.fine.balances[0].amount),
      secondaryBalance: debtor.fine.balances[1] && formatPrice(debtor.fine.balances[1].amount),
      fine: debtor.fine.balances[0].fine && formatPrice(
          debtor.fine.balances[0].fine
      ),
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