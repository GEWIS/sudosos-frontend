<template>
  <DataTable :value="invoice.invoiceEntries" class="w-full">
    <Column field="description" :header="$t('transactions.description')"/>
    <Column field="amount" :header="$t('transactions.amount')"/>
    <Column field="priceInclVat" :header="$t('transactions.price')">
      <template #body="slotProps">
        {{ formatPrice(slotProps.data.priceInclVat) }}
      </template>
    </Column>
    <Column field="vatPercentage" header="VAT"/>
    <Column header="TOTAL">
      <template #body="slotProps">
        {{ formatPrice(rowTotal(slotProps.data)) }}
      </template>
    </Column>
  </DataTable>
  <div style="max-width: 20rem; margin-right:0;">
    <InfoSpan label="Total Excl. VAT" :value="formatPrice(exclVat)"/>
    <InfoSpan v-for="key in Object.keys(vat)"  v-bind:key="key"
              :label="`VAT ${key}%`" :value="formatPrice(vat[key as any])"/>
    <InfoSpan label="Total Incl. VAT" :value="formatPrice(inclVat)"/>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from "@/utils/formatterUtils";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InfoSpan from "@/components/InfoSpan.vue";
import { onMounted, type PropType, type Ref, ref } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import type { DineroObject } from "dinero.js";

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true,
  },
});

const exclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });
const vat: Ref<Record<number, DineroObject>> = ref({});
const inclVat: Ref<DineroObject> = ref({ amount: 0, precision: 2, currency: 'EUR' });

const rowTotal = (row: any): DineroObject => {
  return {
    ...row.priceInclVat,
    amount: row.amount * row.priceInclVat.amount,
  };
};

onMounted(() => {
  props.invoice.invoiceEntries.forEach((entry) => {
    const price = entry.priceInclVat.amount * entry.amount;
    inclVat.value.amount += price;

    const excl = Math.round(price / (1 + (entry.vatPercentage / 100)));
    const vatAmount = price - excl;
    exclVat.value.amount += excl;

    if (entry.vatPercentage in vat.value) {
      vat.value[entry.vatPercentage].amount += vatAmount;
    } else {
      vat.value[entry.vatPercentage] = { amount: vatAmount, precision: 2, currency: 'EUR' };
    }
  });
});



</script>

<style scoped lang="scss">

</style>
