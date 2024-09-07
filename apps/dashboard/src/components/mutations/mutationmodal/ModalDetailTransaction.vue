<template>
  <div class="flex flex-column">
    <span>
      {{ new Date(transactionInfo.createdAt!!).toLocaleString('nl-NL', {
        dateStyle: 'short',
        timeStyle: 'short'
      }) }}
    </span>
    <Translation
      v-if="
        transactionInfo.from.id == userStore.current.user!!.id
      "
      keypath="components.mutations.userBoughtAt" tag="div">
      <template v-slot:pos>
        <span class="font-bold">{{ transactionInfo.pointOfSale.name }}</span>
      </template>
    </Translation>

    <Translation
      v-if="
        transactionInfo.from.id != userStore.current.user!!.id
      "
      keypath="components.mutations.otherBoughtAt" tag="div">
      <template v-slot:user>
        <span
          class="font-bold">
          {{ transactionInfo.from.firstName }}
          {{ transactionInfo.from.lastName }}
        </span>

      </template>
      <template v-slot:pos>
        <span class="font-bold">{{ transactionInfo.pointOfSale.name }}</span>
      </template>
    </Translation>

    <Translation
      v-if="
        transactionInfo.createdBy
        && transactionInfo.createdBy.id != transactionInfo.from.id
      "
      keypath="components.mutations.putInBy" tag="div">

      <template v-slot:createdBy>
        <span class="font-bold">
          {{ transactionInfo.createdBy.firstName }}
          {{ transactionInfo.createdBy.lastName }}
        </span>
      </template>
    </Translation>

    <br>
    <DataTable
      :value="productsInfo"
      :pt="{
        tfoot: 'font-bold'
      }"
    >
      <Column field="amount" header="#" class="p-1"></Column>
      <Column field="product.name" :header="t('common.title')" class="p-1"></Column>
      <Column
        field="product.priceInclVat"
        :header="t('common.price')"
        class="p-1"
        footerClass="font-bold"
        :footer="t('common.total')"
      >
        <template #body="product">
            {{ formatPrice(product.data.product.priceInclVat) }}
        </template></Column>
      <Column
        field="totalPriceInclVat"
        :header="t('common.amount')"
        class="p-1"
        footerClass="font-bold"
        :footer="formatPrice(transactionInfo.totalPriceInclVat)"
        >
        <template #body="product">
            {{ formatPrice(product.data.totalPriceInclVat) }}
        </template>
      </Column>
    </DataTable>


  </div>
</template>
<script setup lang="ts">
import { formatPrice } from "@/utils/formatterUtils";
import type { SubTransactionRowResponse } from "@sudosos/sudosos-client/src/api";
import type { TransactionResponse } from "@sudosos/sudosos-client";
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { Translation, useI18n } from "vue-i18n";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const { t } = useI18n();

const userStore = useUserStore();

defineProps({
  transactionInfo: {
    type: Object as () => TransactionResponse,
    required: true,
  },
  productsInfo: {
    type: Object as () => Array<SubTransactionRowResponse>,
      required: true
    }
});
</script>
