<template>
  <div class="page-container-wide flex flex-column">
    <div class="page-title">{{ t('modules.financial.debtor.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="t('modules.financial.debtor.debtorUsers.header')" class="w-full">
        <DataTable :value="debtorRows" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem"
                   removableSort lazy
                   filterDisplay="row"
                   @sort="event => console.log('event', event)"
                   v-model:selection="selectedUsers">

          <Column selectionMode="multiple" style="width: 2%" />

          <Column field="id" header="Id" style="width: 5%"></Column>

          <Column field="name" header="Name" sortable style="width: 15%">
            <template #body="{ data }">
              {{ data.name }}
            </template>
            <template #filter>
              <InputText v-model="nameFilter" type="text" class="p-column-filter" placeholder="Search" />
            </template>
          </Column>

          <Column field="secondaryBalance" filter-match-mode="notEquals" :header="secondaryBalanceHeader" sortable :showFilterMenu="false" style="width: 15%">
            <template #body="{ data }">
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

          <Column field="primaryBalance" filter-match-mode="notEquals" :header="primaryBalanceHeader" sortable :showFilterMenu="false" style="width: 15%">
            <template #body="{ data }">
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

          <Column field="fine" header="Fine" sortable style="width: 20%"></Column>

          <Column field="negativeSince" header="Negative since" style="width: 20%"></Column>

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
import { useDebtorStore } from "@/stores/debtor.store";
import { computed, type ComputedRef, onMounted, ref, watch } from "vue";
import Calendar from "primevue/calendar";
import Column from "primevue/column";
import { formatPrice } from "@/utils/formatterUtils";

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

// Primary balance
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
  await updateLazyDebtors();
}

// Filters that purely cosmetic
const nameFilter = ref<string>("");


// Updates filter based on properties that are not related to calculated fines
watch(nameFilter, updateLazyDebtors);
async function updateLazyDebtors() {
  await debtorStore.fetchLazyDebtors(10, 0, nameFilter.value);
}


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
      )
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