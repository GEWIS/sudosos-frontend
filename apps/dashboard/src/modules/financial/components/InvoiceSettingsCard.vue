<template>
  <FormCard :header="$t('c_invoiceInfo.Settings')" v-if="invoice" @update:modelValue="edit = $event" @save="formSubmit">
      <div class="flex flex-column justify-content-between gap-2">
        <InvoiceSettingsForm :invoice="invoice" :form="form" :edit="edit" @update:edit="edit = $event"/>
      </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onBeforeMount, type PropType, ref, watch } from "vue";
import InvoiceSettingsForm from "@/modules/financial/components/forms/InvoiceSettingsForm.vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { updateInvoiceSettingsSchema } from "@/utils/validation-schema";
import { specToForm } from "@/utils/formUtils";

const edit = ref(false);

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
  }
});

const form = specToForm(updateInvoiceSettingsSchema);

const formSubmit = () => {
  form.submit();
};
const updateFieldValues = (p: InvoiceResponse) => {
  if (!p) return;
  const reference = p.reference;
  const date = p.createdAt;
  const description = p.description;
  form.context.resetForm();
  form.context.setValues({ reference, date, description });
};

watch(() => props.invoice, (newValue) => {
  updateFieldValues(newValue);
});

onBeforeMount(() => {
  if (props.invoice) {
    updateFieldValues(props.invoice);
  }
});

</script>

<style scoped lang="scss">

</style>
