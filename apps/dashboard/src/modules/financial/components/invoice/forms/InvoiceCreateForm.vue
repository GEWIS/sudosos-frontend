<template>
  <span class="text-gray-700">{{
      `Creating invoice for ${form.model.for.value.value.firstName} ${form.model.for.value.value.lastName} as `
    }}</span>
  <UserLink :user="form.model.by.value.value"/>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="$t('c_invoiceInfo.Description')"
               :value="form.model.description.value.value"
               :attributes="form.model.description.attr.value"
               @update:value="form.context.setFieldValue('description', $event)"
               :errors="form.context.errors.value.description"
               id="description" placeholder="Invoice Description" type="textarea"/>
    <InputSpan :label="$t('c_invoiceInfo.Reference')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.context.setFieldValue('reference', $event)"
               :errors="form.context.errors.value.reference"
               id="reference" placeholder="Invoice Reference" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.Date')"
               :value="form.model.date.value.value"
               :attributes="form.model.date.attr.value"
               @update:value="form.context.setFieldValue('date', $event)"
               :errors="form.context.errors.value.date"
               id="date" placeholder="Invoice Date" type="date"/>
    <InputSpan :label="$t('c_invoiceInfo.Addressee')"
               :value="form.model.addressee.value.value"
               :attributes="form.model.addressee.attr.value"
               @update:value="form.context.setFieldValue('addressee', $event)"
               :errors="form.context.errors.value.addressee"
               id="addressee" placeholder="Addressee" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.Attention')"
               :value="form.model.attention?.value.value"
               :attributes="form.model.attention?.attr.value"
               @update:value="form.context.setFieldValue('attention', $event)"
               :errors="form.context.errors.value.attention"
               id="attention" placeholder="Attention" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.Street')"
               :value="form.model.street.value.value"
               :attributes="form.model.street.attr.value"
               @update:value="form.context.setFieldValue('street', $event)"
               :errors="form.context.errors.value.street"
               id="street" placeholder="Street" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.Postal code')"
               :value="form.model.postalCode.value.value"
               :attributes="form.model.postalCode.attr.value"
               @update:value="form.context.setFieldValue('postalCode', $event)"
               :errors="form.context.errors.value.postalCode"
               id="postalCode" placeholder="Postal code" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.City')"
               :value="form.model.city.value.value"
               :attributes="form.model.city.attr.value"
               @update:value="form.context.setFieldValue('city', $event)"
               :errors="form.context.errors.value.city"
               id="city" placeholder="City" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.Country')"
               :value="form.model.country.value.value"
               :attributes="form.model.country.attr.value"
               @update:value="form.context.setFieldValue('country', $event)"
               :errors="form.context.errors.value.country"
               id="country" placeholder="Country" type="text"/>
    <InputSpan :label="$t('c_invoiceInfo.IsCreditInvoice')"
               :value="form.model.isCreditInvoice.value.value"
               :attributes="form.model.isCreditInvoice.attr.value"
               @update:value="form.context.setFieldValue('isCreditInvoice', $event)"
               :errors="form.context.errors.value.isCreditInvoice"
               id="isCreditInvoice" type="switch"/>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import { createInvoiceSchema } from "@/utils/validation-schema";
import UserLink from "@/components/UserLink.vue";
import InputSpan from "@/components/InputSpan.vue";
import { useInvoiceStore } from "@/stores/invoice.store";
import type { CreateInvoiceRequest, InvoiceResponse } from "@sudosos/sudosos-client";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceSchema>>>,
    required: true,
  },
});
const { t } = useI18n();
const invoiceStore = useInvoiceStore();
const toast = useToast();
const router = useRouter();

const emit = defineEmits(['submit:success', 'submit:error']);

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  const request: CreateInvoiceRequest = {
    forId: props.form.model.for.value.value.id,
    byId: props.form.model.by.value.value.id,
    addressee: values.addressee,
    description: values.description,
    date: values.date,
    reference: values.reference,
    isCreditInvoice: values.isCreditInvoice,
    street: values.street,
    postalCode: values.postalCode,
    city: values.city,
    country: values.country,
    attention: values.attention,
  };
  await invoiceStore.createInvoice(request).then((res: InvoiceResponse) => {
    const invoiceId = res.id;
    emit('submit:success', request);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.invoiceCreated'),
      life: 3000,
    });
    props.form.context.resetForm();
    router.push({ name: "invoiceInfo", params: { id: invoiceId } });
  }).catch((err) => {
    emit('submit:error', err);
    handleError(err, toast);
  });
}));
</script>

<style scoped>

</style>
