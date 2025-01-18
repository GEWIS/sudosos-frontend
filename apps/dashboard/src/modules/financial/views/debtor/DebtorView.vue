<template>
  <div class="page-container-wide flex flex-column">
    <div class="page-title">{{ t('modules.financial.debtor.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="t('modules.financial.debtor.debtorUsers.header')" class="w-full">
        <DataTable :value="debtorRows" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle="min-width: 50rem" removableSort
                   v-model:filters="filters" filterDisplay="row">
          <Column field="id" header="Id" style="width: 5%"></Column>
          <Column field="name" header="Name" sortable style="width: 15%"></Column>
          <Column filterField="balance2" header="Balance now" sortable style="width: 20%">
            <template #body="{ data }">
              {{ data.balance2 }}
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <InputText v-model="filterModel.value" type="text" @input="filterCallback()" class="p-column-filter" placeholder="Search by name" />
            </template>
          </Column>
          <Column field="balance1" header="Balance on 17 Jan 2025" sortable style="width: 20%"></Column>
          <Column field="fine" header="Fine" sortable style="width: 20%"></Column>
          <Column field="negativeSince" header="Negative since" style="width: 20%"></Column>
        </DataTable>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import CardComponent from "@/components/CardComponent.vue";
import { useDebtorStore } from "@/stores/debtor.store";
import {computed, type ComputedRef, onMounted, ref} from "vue";
import type { DineroObject } from "dinero.js";

const { t } = useI18n();

const debtorStore = useDebtorStore();

const filters = ref({
  balance2: ""
});

interface DebtorRow {
  id: number;
  name: string;
  balance1: string;
  balance2: string;
  fine: string;
}

// Convert data from the store to something that can be displayed by the datatable
const debtorRows: ComputedRef<DebtorRow[]> = computed(() => {


  return [{
    id: 10253,
    name: "Victor de Defaulter",
    balance1: "",
    balance2: "-€5,40",
    fine: "€3,40"
  }];
});

onMounted(() => {

});

</script>

<style scoped lang="scss">

</style>