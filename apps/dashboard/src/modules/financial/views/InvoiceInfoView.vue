<template>
  <div class="page-container-large align-items-center flex flex-column gap-5" v-if="invoice">
    <div>
      <div class="page-title flex flex-row">
        <div class="flex flex-column">
          <span>{{ $t("invoice.Invoice") }}</span>
          <small class="text-base">
            BAC-2223-15: <i>{{ invoice.description }}</i>
          </small>
        </div>
      </div>
      <div class="flex flex-row gap-5 flex-wrap flex-grow justify-content-center">
        <div class="flex flex-column gap-5">
          <InvoiceStepsCard :invoice="invoice"/>
          <InvoiceSettingsCard :invoice="invoice"/>
          <InvoiceAddressingCard :invoice="invoice"/>
          <CardComponent :header="$t('c_invoiceInfo.Info')" v-if="invoice" >
            <template #topAction>
              <Button
                  severity="primary"
                  :label="$t('pdf.delete')"
                  icon="pi pi-exclamation-triangle"
                  @click="showDeleteDialog = true"
              />
            </template>
            <div class="flex flex-column justify-content-between">
              <InfoSpan :label="$t('c_invoiceInfo.id')"
                        :value="invoice.id"/>

              <InfoSpan :label="$t('c_invoiceInfo.For')"
                        :value="invoice.to.firstName + ' ' + invoice.to.lastName + ' (' + invoice.to.id + ')'"/>

              <InfoSpan :label="$t('c_invoiceInfo.Created on')"
                        :value="formatDateTime(new Date(invoice.createdAt ? invoice.createdAt.toString() : ''))"/>

              <InfoSpan :label="$t('c_invoiceInfo.Updated on')"
                        :value="formatDateTime(new Date(invoice.updatedAt ? invoice.updatedAt.toString() : ''))"/>
            </div>
          </CardComponent>
          <InvoiceDeleteDialog :visible="showDeleteDialog" :invoice="invoice"/>
        </div>
        <InvoicePdf v-if="invoice" :invoice="invoice"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, type Ref } from "vue";
import { handleError } from "@/utils/errorUtils";
import { useInvoiceStore } from "@/stores/invoice.store";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { useToast } from "primevue/usetoast";
import "vue3-pdf-app/dist/icons/main.css";
import router from "@/router";
import { useRoute } from "vue-router";
import { formatDateTime } from "@/utils/formatterUtils";
import CardComponent from "@/components/CardComponent.vue";
import InfoSpan from "@/components/InfoSpan.vue";
import InvoiceSettingsCard from "@/modules/financial/components/InvoiceSettingsCard.vue";
import InvoiceAddressingCard from "@/modules/financial/components/InvoiceAddressingCard.vue";
import InvoiceStepsCard from "@/modules/financial/components/InvoiceStepsCard.vue";
import InvoicePdf from "@/modules/financial/components/InvoicePdf.vue";
import InvoiceDeleteDialog from "@/modules/financial/components/InvoiceDeleteDialog.vue";

const toast = useToast();
const route = useRoute();

const invoice: Ref<InvoiceResponse | undefined> = ref(undefined);
const invoiceStore = useInvoiceStore();
const showDeleteDialog = ref(false);

onBeforeMount(async () => {
  const id = Number(route.params.id);
  await invoiceStore.getOrFetchInvoice(id).catch((error) => {
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
