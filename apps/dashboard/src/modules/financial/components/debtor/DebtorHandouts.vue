<template>
  <CardComponent
      :header="t('modules.financial.fine.handoutEvents.header')"
      class="w-full">
    <DataTable
        paginator
        lazy
        v-model:rows="take"
        v-model:first="skip"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        :total-records="debtorStore.totalFineHandoutEvents"
        @page="updateFineHandoutEvents"
        :value="debtorStore.fineHandoutEvents"
    >
      <Column field="id" id="id" :header="t('common.id')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-4 my-1 h-1rem surface-300"/>
        </template>
      </Column>
      <Column field="createdAt" id="date" :header="t('modules.financial.fine.handoutEvents.handoutDate')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-7 my-1 h-1rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>{{ formatDateTime(new Date(slotProps.data.createdAt)) }}</template>
      </Column>
      <Column
          field="referenceDate"
          id="referenceDate"
          :header="t('modules.financial.fine.handoutEvents.referenceDate')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-4 my-1 h-1rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>{{ formatDateTime(new Date(slotProps.data.referenceDate)) }}</template>
      </Column>
      <Column field="count" id="count" :header="t('common.count')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-7 my-1 h-1rem surface-300"/>
        </template>
      </Column>
      <Column id="info" :header="t('common.info')" >
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-2 my-1 h-1rem surface-300"/>
        </template>
        <template #body v-else>
          <i class="pi pi-info-circle"/>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
<!--  <Dialog-->
<!--      v-model:visible="showModal"-->
<!--      class="w-auto flex w-9 md:w-4"-->
<!--      :header="t('modules.financial.fine.handoutEvents.details')">-->
<!--    <div class="flex flex-column">-->
<!--      <div class="flex flex-row justify-content-between">-->
<!--        <p>{{ t("modules.financial.fine.handoutEvents.number") }}</p>-->
<!--        <p>{{ selectedHandoutEvent?.fines.length }}</p>-->
<!--      </div>-->
<!--      <div class="flex flex-row justify-content-between">-->
<!--        <p>{{ t("modules.financial.fine.handoutEvents.total") }}</p>-->
<!--        <p>{{ formatPrice(modalTotalFines) }}-->
<!--        </p>-->
<!--      </div>-->
<!--      <div class="flex flex-row justify-content-between">-->
<!--        <p>{{ t("common.createdAt") }}</p>-->
<!--        <p>{{ formatDateTime(new Date(selectedHandoutEvent?.createdAt || '')) }}</p>-->
<!--      </div>-->
<!--      <div class="flex flex-row justify-content-between">-->
<!--        <p>{{ t("modules.financial.fine.handoutEvents.referenceDate") }}</p>-->
<!--        <p>{{ formatDateTime(new Date(selectedHandoutEvent?.referenceDate || '')) }}</p>-->
<!--      </div>-->
<!--    </div>-->
<!--  </Dialog>-->
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { formatDateTime } from "@/utils/formatterUtils";
import Column from "primevue/column";
import CardComponent from "@/components/CardComponent.vue";
import Skeleton from "primevue/skeleton";
import DataTable from "primevue/datatable";
import { onMounted, ref, watch } from "vue";
import { useDebtorStore } from "@/stores/debtor.store";

const { t } = useI18n();

const debtorStore = useDebtorStore();

const take = ref(10);
const skip = ref(0);

watch([ take, skip ], () => updateFineHandoutEvents);
const updateFineHandoutEvents = () => {
  debtorStore.fetchFineHandoutEvents(take.value, skip.value);
};

onMounted(() => {
  updateFineHandoutEvents();
});
</script>


<style scoped lang="scss">

</style>