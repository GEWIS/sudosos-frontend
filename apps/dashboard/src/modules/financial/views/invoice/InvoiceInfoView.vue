<template>
  <div class="page-container-large align-items-center flex flex-column gap-5" v-if="invoice">
    <div>
      <div class="page-title flex flex-row">
        <div class="flex flex-column">
          <span>{{ t("modules.financial.invoice.invoice") }}</span>
          <small class="text-base">
            {{ invoice.reference + ": " }} <i>{{ invoice.description }}</i>
          </small>
          <span v-if="dirty" class="text-red-500">
            <i class="pi pi-exclamation-triangle text-4xl"></i>
            {{ t("modules.financial.invoice.dirty") }}
          </span>
        </div>
      </div>
      <div class="flex flex-row gap-5 flex-wrap flex-grow justify-content-center">
        <div class="flex flex-column gap-5">
          <InvoiceAmountCard v-if="dirty" :invoiceId="invoice.id"/>
          <InvoiceStepsCard v-else :invoiceId="invoice.id"/>
          <InvoiceSettingsCard :invoiceId="invoice.id"/>
          <InvoiceAddressingCard :invoiceId="invoice.id"/>
          <InvoiceInfo :invoiceId="invoice.id"/>
        </div>
        <InvoicePdf v-if="invoice" :invoiceId="invoice.id"/>
      </div>
    </div>
  </div>
  <Skeleton v-else class="page-container align-items-center flex flex-column gap-5"/>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, type Ref } from "vue";
import { handleError } from "@/utils/errorUtils";
import { useInvoiceStore } from "@/stores/invoice.store";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { useToast } from "primevue/usetoast";
import "vue3-pdf-app/dist/icons/main.css";
import router from "@/router";
import { useRoute } from "vue-router";
import Skeleton from "primevue/skeleton";
import InvoiceSettingsCard from "@/modules/financial/components/invoice/InvoiceSettingsCard.vue";
import InvoiceAddressingCard from "@/modules/financial/components/invoice/InvoiceAddressingCard.vue";
import InvoiceStepsCard from "@/modules/financial/components/invoice/InvoiceStepsCard.vue";
import InvoicePdf from "@/modules/financial/components/invoice/InvoicePdf.vue";
import InvoiceInfo from "@/modules/financial/components/invoice/InvoiceInfo.vue";
import { useI18n } from "vue-i18n";
import InvoiceAmountCard from "@/modules/financial/components/invoice/InvoiceAmountCard.vue";
import { isDirty } from "@/utils/invoiceUtil";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const invoiceStore = useInvoiceStore();

const invoice: Ref<InvoiceResponse | undefined> = ref(undefined);

// Invoice is considered dirty if entry total does not match transfer total
const dirty = computed(() => isDirty(invoice.value as InvoiceResponse));

onBeforeMount(async () => {
  const id = Number(route.params.id);
  await invoiceStore.fetchInvoice(id).catch((error) => {
    handleError(error, toast);
  }).then((res) => {
    invoice.value = res as InvoiceResponse;
  });

  if (!invoice.value) {
    await router.replace('/error');
    return;
  }
});

</script>

<style scoped lang="scss">
</style>
