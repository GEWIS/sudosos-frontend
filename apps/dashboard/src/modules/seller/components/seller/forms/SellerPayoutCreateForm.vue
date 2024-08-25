<template>
  <div class="flex flex-column gap-3">
    <InputSpan :label="$t('sellers.startDate')"
               :value="form.model.fromDate.value.value"
               :attributes="form.model.fromDate.attr.value"
               @update:value="updateDate('fromDate', $event)"
               :errors="form.context.errors.value.fromDate" :disabled="disabled"
               id="name" placeholder="From date" type="date"/>

    <InputSpan :label="$t('sellers.endDate')"
               :value="form.model.toDate.value.value"
               :attributes="form.model.toDate.attr.value"
               @update:value="updateDate('toDate', $event)"
               :errors="form.context.errors.value.tillDate" :disabled="disabled"
               id="name" placeholder="From date" type="date"/>

    <InputSpan :label="$t('sellers.Description')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.context.setFieldValue('reference', $event)"
               :errors="form.context.errors.value.reference" :disabled="disabled"
               id="name" column type="textarea" placeholder="Enter payout description"/>
    <div>
                <span class="flex flex-wrap justify-content-between flex-row align-items-center gap-3">
                    <p class="my-0">{{ $t('sellers.Amount') }}</p>
                        <InputNumber mode="currency" currency="EUR" locale="nl-NL"
                                     :min="0.0" v-if="payoutAmount"
                                     :min-fraction-digits="0" :max-fraction-digits="2"
                                     v-model="payoutAmount" disabled/>
                        <Button v-else type="submit" severity="info" @click="calculatePayoutAmount"
                                class="w-6" :disabled="!datesSelected">{{ $t('sellers.Calculate Amount') }}</Button>
                </span>
    </div>
    <span v-if="payoutAmount" class="flex flex-wrap justify-content-between flex-row align-items-center gap-3">
          <p class="my-0 text-red-500"><i class="pi pi-exclamation-triangle red-500"/> Make sure to check report before creating a payout!</p>
          <Button type="submit" class="w-3" @click="getReportPdf" v-if="!pdfLoading">
            {{ $t('sellers.PDF') }}</Button>
          <ProgressSpinner v-else class="w-1 h-1"/>
    </span>
  </div>
</template>

<script setup lang="ts">
import InputNumber from "primevue/inputnumber";
import InputSpan from "@/components/InputSpan.vue";
import { createSellerPayoutObject } from "@/utils/validation-schema";
import { type Form, setSubmit, setSuccess } from "@/utils/formUtils";
import { computed, type PropType, ref, watch } from "vue";
import ApiService from "@/services/ApiService";
import type { UserResponse } from "@sudosos/sudosos-client";

const props = defineProps({
  form: {
    type: Object as PropType<Form<createSellerPayoutObject>>,
    required: true,
  },
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
});

const payoutAmount = ref(null);

const datesSelected = computed(() => {
  return props.form.model.fromDate.value.value !== undefined && props.form.model.toDate.value.value !== undefined;
});

watch(() => props.form.model.fromDate.value.value, () => {
  payoutAmount.value = null;
});
watch(() => props.form.model.toDate.value.value, () => {
  payoutAmount.value = null;
});

const updateDate = (field: string, value: string) => {
  props.form.context.setFieldValue(field, value);
  payoutAmount.value = null;
};

const calculatePayoutAmount = async () => {
  console.log(props.form.model.fromDate.value.value, props.form.model.toDate.value.value);
  const amount = await ApiService.user.getUsersSalesReport(props.seller.id, props.form.model.fromDate.value.value, props.form.model.toDate.value.value);
  console.error(amount.data);
  payoutAmount.value = amount.data.totalInclVat.amount / 100;
};

const pdfLoading = ref(false);
const getReportPdf = async () => {
  pdfLoading.value = true;
  try {
    const report = await ApiService.user.getUsersSalesReportPdf(
        props.seller.id,
        props.form.model.fromDate.value.value,
        props.form.model.toDate.value.value,
        props.form.model.reference.value.value,
        'PDF',
        { responseType: 'arraybuffer' }
    );
    pdfLoading.value = false;
    // Create a Blob from the PDF buffer data
    const blob = new Blob([report.data], { type: 'application/pdf' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;

    // Set the file name for the download
    link.download = `${props.seller.firstName}_${props.seller.lastName}_SalesReport.pdf`;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading PDF:', error);
    pdfLoading.value = false;
  }
};

const emit = defineEmits(['update:edit']);
setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  setSuccess(props.form, null);
  await new Promise((resolve) => setTimeout(resolve, 200)); // Replace with actual API call
  const result = Math.random() < 0.5;
  console.error('res', result);
  setSuccess(props.form, result);
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }
  console.error(values);
}));

</script>

<style scoped lang="scss">

</style>
