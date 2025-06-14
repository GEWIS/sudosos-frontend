<template>
  <CardComponent v-if="invoice" :header="t('common.status')">
    <Steps v-if="!deleted" :active-step="activeStep" :model="stepItems" :readonly="false"></Steps>
    <div v-else class="items-center flex flex-col justify-center">
      <i class="pi pi-exclamation-triangle text-5xl"></i>
      <p class="text-2xl">{{ t('modules.financial.invoice.deleted') }}</p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import { useI18n } from 'vue-i18n';
import { useInvoiceStore } from '@/stores/invoice.store';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const invoiceStore = useInvoiceStore();

const steps = [
  InvoiceStatusResponseStateEnum.Created,
  InvoiceStatusResponseStateEnum.Sent,
  InvoiceStatusResponseStateEnum.Paid,
  InvoiceStatusResponseStateEnum.Deleted,
];
const activeStep = computed(() => steps.indexOf(invoice.value.currentState.state));
const deleted = computed(() => invoice.value.currentState.state === InvoiceStatusResponseStateEnum.Deleted);
const loading = ref(false);

const stepItems = steps.slice(0, 3).map((value, index) => {
  return {
    label: value,
    disabled: () => activeStep.value >= index || loading.value,
    command: () => {
      void updateStep(index, value);
    },
  };
});

const updateStep = async (index: number, value: InvoiceStatusResponseStateEnum) => {
  loading.value = true;
  await invoiceStore.updateInvoice(invoice.value.id, { state: value });
  loading.value = false;
};

const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId) as InvoiceResponse);
const props = defineProps({
  invoiceId: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped lang="scss"></style>
