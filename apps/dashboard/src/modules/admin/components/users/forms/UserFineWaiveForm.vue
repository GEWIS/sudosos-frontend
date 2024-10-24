<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('common.amount')"
               :value="form.model.amount.value.value"
               :attributes="form.model.amount.attr.value"
               @update:value="form.context.setFieldValue('amount', $event)"
               :errors="form.context.errors.value.amount"
               id="name" :placeholder="t('common.amount')" type="currency" />
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { type Form, setSubmit } from "@/utils/formUtils";
import type { UserResponse } from "@sudosos/sudosos-client";
import { type PropType } from "vue";
import * as yup from "yup";
import { waiveUserFineSchema } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";

const { t } = useI18n();
const toast = useToast();

const isVisible = defineModel('isVisible');

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof waiveUserFineSchema>>>,
    required: true,
  },
});

const userStore = useUserStore();

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  await userStore.waiveUserFine(
      props.user.id,
      {
        amount: values.amount*100 || 0,
        currency: 'EUR',
        precision: 2
      },
      apiService
  ).then(async () => {

    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.waiveFinesSuccess'),
      life: 3000
    });
    await userStore.fetchUserBalance(props.user.id, apiService);
    isVisible.value = false;
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>
