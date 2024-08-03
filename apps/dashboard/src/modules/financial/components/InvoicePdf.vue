<template>
  <CardComponent header="">
    <template #topAction>
      <div class="flex flex-row gap-1 justify-content-between" style="width: 40vw">
        <div>
          <Button
              severity="primary"
              :label="$t('pdf.table')"
              icon="pi pi-pencil"
              @click="showTable = !showTable"
          />
        </div>
        <div class="flex flex-row gap-3">
          <Button
              severity="primary"
              :label="$t('pdf.recompile')"
              icon="pi pi-sync"
              @click="reloadPdf"
          />
          <Button
              severity="secondary"
              :label="$t('pdf.reload')"
              icon="pi pi-refresh"
              @click="reloadPdf"
          />
        </div>
      </div>
    </template>
    <div class="pdf-display" :class="{ hidden: showTable }">
      <div v-if="missingPdf && pdfLoaded" class="w-full h-full flex flex-column justify-content-center align-items-center text-4xl text-red-500">
        <i class="pi pi-exclamation-triangle text-5xl"></i>
        {{ $t('pdf.missing') }}
      </div>
      <Skeleton v-if="!pdfLoaded" class="w-full h-full"/>
      <vue-pdf-app v-if="showPdf" class="w-full h-full" :pdf="getInvoicePdfSrc(invoice.pdf)"/>
    </div>
    <div class="pdf-display overflow-scroll" :class="{ hidden: !showTable }">
      <InvoiceEntriesTable :invoice="invoice"/>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { getInvoicePdfSrc } from "@/utils/urlUtils";
import { handleError } from "@/utils/errorUtils";
import { computed, onMounted, ref } from "vue";
import { useInvoiceStore } from "@/stores/invoice.store";
import { useToast } from "primevue/usetoast";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import VuePdfApp from "vue3-pdf-app";
import InvoiceEntriesTable from "@/modules/financial/components/forms/InvoiceEntriesTable.vue";

const invoiceStore = useInvoiceStore();
const toast = useToast();
const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true
  }
});

const showPdf = computed(() => pdfLoaded.value && !missingPdf.value);
const showTable = ref(false);
const pdfLoaded = ref(false);
const missingPdf = ref(false);

onMounted(() => {
  pdfLoaded.value = true;
  if (!invoice.value.pdf) {
    missingPdf.value = true;
  }
});

const reloadPdf = () => {
  if (!invoice.value) return;
  pdfLoaded.value = false;
  invoiceStore.fetchInvoicePdf(invoice.value.id)
    .catch(error => handleError(error, toast))
    .finally(() => {
      pdfLoaded.value = true;
    });
};
</script>

<style scoped lang="scss">
.pdf-display {
  height: 80vh;
  width: 40vw;
}
</style>
