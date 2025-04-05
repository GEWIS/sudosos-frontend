<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputUserSpan :label="t('modules.financial.forms.payout.for')"
                   :value="form.model.user.value.value"
                   @update:value="form.context.setFieldValue('user', $event)"
                   :errors="form.context.errors.value.user"
                   :show-positive="true"
                   id="name" placeholder="John Doe"/>

    <skeleton v-if="userBalance === null && form.model.user.value.value" class="w-6 my-1 h-0.5rem surface-300"/>
    <div v-else-if="userBalance" class="flex flex-row gap-1"
         :class="{'text-gray-700': !balanceError, 'text-red-500 font-bold': balanceError}">
      <span>
        {{ t('modules.financial.forms.payout.currentBalance', { balance: formatPrice(userBalance.amount) }) }}</span>
    </div>

    <div class="flex w-full justify-content-end">
      <ErrorSpan :error="balanceError"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, type Ref, watch } from "vue";
import * as yup from "yup";
import { useI18n } from "vue-i18n";
import { type createWriteOffSchema } from "@/utils/validation-schema";
import type { Form } from "@/utils/formUtils";
import { setSubmit } from "@/utils/formUtils";
import { useToast } from "primevue/usetoast";
import InputUserSpan from "@/components/InputUserSpan.vue";
import { formatPrice } from "@/utils/formatterUtils";
import apiService from "@/services/ApiService";
import type { BalanceResponse } from "@sudosos/sudosos-client";
import ErrorSpan from "@/components/ErrorSpan.vue";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['submit:success', 'submit:error']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createWriteOffSchema>>>,
    required: true,
  },
});

const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);
const balanceError = ref<string>('');
watch(() => props.form.model.user.value.value, () => {
  if (props.form.model.user.value.value.id) {
    apiService.balance.getBalanceId(props.form.model.user.value.value.id).then((res) => {
      userBalance.value = res.data;
    }).catch(() => {
      userBalance.value = undefined;
    });
  }
});

const validateAmount = () => {
  if (userBalance.value && userBalance.value.amount.amount >= 0) {
    balanceError.value = `${t('modules.financial.forms.write-off.negative')}`;
  } else {
    balanceError.value = '';
  }
};

watch(() => userBalance.value, () => {
  validateAmount();
});

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  console.error('values', values);
}));

</script>

<style scoped lang="scss">

</style>
