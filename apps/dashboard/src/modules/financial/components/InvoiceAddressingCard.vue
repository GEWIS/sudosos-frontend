<template>
  <FormCard :header="$t('c_invoiceInfo.Settings')" v-if="invoice" @cancel="updateFieldValues(invoice)" @update:modelValue="edit = $event" @save="formSubmit">
    <div class="flex flex-column justify-content-between gap-2">
      <InvoiceAddressingForm :invoice="invoice" :form="form" :edit="edit" @update:edit="edit = $event"/>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onBeforeMount, type PropType, ref, watch } from "vue";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import InvoiceAddressingForm from "@/modules/financial/components/forms/InvoiceAddressingForm.vue";
import { updateInvoiceAddressingObject } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";

const edit = ref(false);

const props = defineProps({
  invoice: {
    type: Object as PropType<InvoiceResponse>,
    required: true
  }
});

const form = schemaToForm(updateInvoiceAddressingObject);

const formSubmit = () => {
  form.submit();
};
const updateFieldValues = (p: InvoiceResponse) => {
  if (!p) return;
  const values = {
    addressee: p.addressee,
    attention: p.attention,
    street: p.street,
    postalCode: p.postalCode,
    city: p.city,
    country: p.country,
  };
  form.context.resetForm();
  form.context.setValues(values);
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
