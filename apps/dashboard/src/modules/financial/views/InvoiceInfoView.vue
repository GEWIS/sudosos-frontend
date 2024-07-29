<template>
  <div class="page-container-large align-items-center flex flex-column gap-5" v-if="invoice">
    <div class="page-title flex flex-row">
      <div class="flex flex-column">
        <span>{{ $t("invoice.Invoice") }}</span>
        <small class="text-base">
          BAC-2223-15: <i>{{ invoice.description }}</i>
        </small>
      </div>
    </div>
    <div class="flex flex-row gap-5">
      <div class="flex flex-column gap-5">
        <CardComponent :header="$t('c_invoiceInfo.Progress')" v-if="invoice">
          <Steps :model="stepItems" :readonly="false" :activeStep="activeStep"></Steps>
        </CardComponent>
        <InvoiceSettingsCard :invoice="invoice"/>
        <CardComponent :header="$t('c_invoiceInfo.Addressing')" v-if="invoice">
          <template #topAction>
            <!-- Edit button -->
            <Button
                severity="primary"
                :label="$t('edit')"
                icon="pi pi-pencil"
                @click="reloadPdf"
            />
          </template>
          <div class="flex flex-column justify-content-between gap-3">
            <InfoSpan :label="$t('c_invoiceInfo.Addressee')"
                      :value="invoice.addressee"/>
            <InfoSpan :label="$t('c_invoiceInfo.Street')"
                      :value="invoice.street"/>
            <InfoSpan :label="$t('c_invoiceInfo.Postal code')"
                      :value="invoice.postalCode"/>
            <InfoSpan :label="$t('c_invoiceInfo.City')"
                      :value="invoice.city"/>
            <InfoSpan :label="$t('c_invoiceInfo.Country')"
                      :value="invoice.country"/>
          </div>
        </CardComponent>
        <CardComponent :header="$t('c_invoiceInfo.Info')" v-if="invoice">
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
      </div>
      <div>
        <div class="flex flex-row gap-1 justify-content-end">
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
        <vue-pdf-app v-if="pdfLoaded" style="height: 90vh;width: 40vw;" :pdf="getInvoicePdfSrc(invoice.pdf)"></vue-pdf-app>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, type Ref, watch } from "vue";
import { handleError } from "@/utils/errorUtils";
import { useInvoiceStore } from "@/stores/invoice.store";
import type { InvoiceResponse, VatGroupResponse } from "@sudosos/sudosos-client";
import { useToast } from "primevue/usetoast";
import VuePdfApp from "vue3-pdf-app";
import "vue3-pdf-app/dist/icons/main.css";
import router from "@/router";
import { useRoute } from "vue-router";
import { getInvoicePdfSrc } from "@/utils/urlUtils";
import CardComponent from "@/components/CardComponent.vue";
import { formatDateTime } from "@/utils/formatterUtils";
import InfoSpan from "@/components/InfoSpan.vue";
import InvoiceSettingsCard from "@/modules/financial/components/InvoiceSettingsCard.vue";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";

const toast = useToast();
const route = useRoute();
const pdfLoaded = ref(false);

const invoice: Ref<InvoiceResponse | null> = ref(null);
const invoiceStore = useInvoiceStore();

const activeStep = ref(0);
const stepItems = [
  {
    label: InvoiceStatusResponseStateEnum.Created,
    disabled: () => activeStep.value >= 0,
    command: () => {
      activeStep.value = 0;
      reloadPdf();
    }
  },
  {
    label: InvoiceStatusResponseStateEnum.Sent,
    disabled: () => activeStep.value >= 1,
    command: () => {
      activeStep.value = 1;
      reloadPdf();
    }
  },
  {
    label: InvoiceStatusResponseStateEnum.Paid,
    disabled: () => activeStep.value >= 2,
    command: () => {
      activeStep.value = 2;
      reloadPdf();
    }
  }
];

const reloadPdf = () => {
  if (!invoice.value) return;
  pdfLoaded.value = false;
  invoiceStore.fetchInvoicePdf(invoice.value.id).then(() => {
    pdfLoaded.value = true;
  }).catch((error) => {
    handleError(error, toast);
  });
};

onBeforeMount(async () => {
  // invoice.value.
  const id = Number(route.params.id);
  await invoiceStore.getOrFetchInvoice(id).catch((error) => {
    handleError(error, toast);
  }).then((i) => {
    invoice.value = i as InvoiceResponse;
  });

  if (!invoice.value) {
    await router.replace('/error');
    return;
  }

  if (invoice.value.pdf) {
    pdfLoaded.value = true;
  }

  // if (invoice.value.currentState) {
  //   activeStep.value = invoice.value.currentState.state;
  // }
});

</script>

<style scoped lang="scss">

</style>
