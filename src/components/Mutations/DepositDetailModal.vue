<script setup lang="ts">
import type { TransferResponse } from "@sudosos/sudosos-client";
import { formatPrice } from "../../utils/formatterUtils";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

defineProps({
  depositInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});


</script>

<template>
  <div class="flex flex-column">
    <span>
      {{ new Date(depositInfo.createdAt!!).toLocaleString('nl-NL', {
        dateStyle: 'short',
        timeStyle: 'short'
      }) }}
    </span>
    <span>{{ $t("transactions.depositDescr") }}</span>
    <br>
    <DataTable
      :value="[depositInfo]"
      :pt="{
        tfoot: 'font-bold'
      }"
    >
      <Column 
        field="description" 
        :header="$t('transactions.depositID')" 
        class="p-1">
        <template #body="product">
          <span class="text-sm xl:text-base">{{ depositInfo.description }}</span>
        </template>
      </Column>
      <Column 
        field="totalPriceInclVat" 
        :header="$t('transactions.amount')"
        class="p-1"
        footerClass="font-bold"
        >
        <template #body="product">
            {{ formatPrice(depositInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
</style>
