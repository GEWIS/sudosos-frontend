<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="$t('c_invoiceInfo.Reference')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.model.reference.value.value = $event"
               :errors="form.context.errors.value.reference"
               id="name" placeholder="BAC-2324-000" type="text" :disabled="!edit"/>

    <InputSpan :label="$t('c_invoiceInfo.Date')"
               :value="form.model.date.value.value"
               :attributes="form.model.date.attr.value"
               @update:value="form.model.date.value.value = $event"
               :errors="form.context.errors.value.date"
               type="date" :disabled="!edit"/>

    <InputSpan :label="$t('c_invoiceInfo.Description')"
               :value="form.model.description.value.value"
               :attributes="form.model.description.attr.value"
               @update:value="form.model.description.value.value = $event"
               :errors="form.context.errors.value.description"
               id="name" column type="textarea" :disabled="!edit"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { type PropType, ref } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import type { Form } from "@/utils/formUtils";
import { updateInvoiceSettingsSchema } from "@/utils/validation-schema";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
  },
  form: {
    type: Object as PropType<Form<typeof updateInvoiceSettingsSchema>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

props.form.submit = props.form.context.handleSubmit(async (values: any) => {
  console.error(values);
  toast.add({
    severity: 'success',
    summary: t('successMessages.success'),
    detail: values,
    life: 3000,
  });
  emit('update:edit', false);
});
</script>

<style scoped lang="scss">

</style>
