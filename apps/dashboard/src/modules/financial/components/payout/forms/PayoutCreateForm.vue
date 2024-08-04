<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputUserSpan :label="$t('payout.For')"
                   :value="form.model.user.value.value"
                   @update:value="form.context.setFieldValue('user', $event)"
                   :errors="form.context.errors.value.user"
                   id="name" placeholder="John Doe" type="text"/>
    <skeleton v-if="loadingBalance" class="w-6 my-1 h-0.5rem surface-300"/>
    <div v-else-if="userBalance" class="flex flex-row gap-1"
         :class="{'text-gray-700': !false, 'text-red-500 font-bold': false}">
      <span>User has a current balance of</span>
      <span>{{ formatPrice(userBalance?.amount) }}</span>
    </div>

    <InputSpan :label="$t('payout.BankAccountNumber')"
               :value="form.model.bankAccountNumber.value.value"
               :attributes="form.model.bankAccountNumber.attr.value"
               @update:value="form.context.setFieldValue('bankAccountNumber', $event)"
               :errors="form.context.errors.value.bankAccountNumber"
               id="name" placeholder="NL69 ABNA 0012 3456 78" type="text"/>

    <InputSpan :label="$t('payout.BankAccountName')"
               :value="form.model.bankAccountName.value.value"
               :attributes="form.model.bankAccountName.attr.value"
               @update:value="form.context.setFieldValue('bankAccountName', $event)"
               :errors="form.context.errors.value.bankAccountName"
               id="name" placeholder="John Doe" type="text"/>

    <InputSpan :label="$t('payout.Amount')"
               :value="form.model.amount.value.value"
               :attributes="form.model.amount.attr.value"
               @update:value="form.context.setFieldValue('amount', $event)"
               :errors="form.context.errors.value.amount"
               id="name" placeholder="Amount" type="currency"/>
    <div class="flex w-full justify-content-end">
      <ErrorSpan :error="balanceError"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Form } from "@/utils/formUtils";
import { type PropType, ref, type Ref, watch } from "vue";
import * as yup from "yup";
import type { createPayoutSchema } from "@/utils/validation-schema";
import InputSpan from "@/components/InputSpan.vue";
import InputUserSpan from "@/components/InputUserSpan.vue";
import type { BalanceResponse, PayoutRequestRequest } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";
import { formatPrice } from "@/utils/formatterUtils";
import { useI18n } from "vue-i18n";
import ErrorSpan from "@/components/ErrorSpan.vue";
import { usePayoutStore } from "@/stores/payout.store";
import { useToast } from "primevue/usetoast";

const emit = defineEmits(['submit:success', 'submit:error']);

const payoutStore = usePayoutStore();

const { t } = useI18n();
const toast = useToast();
const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createPayoutSchema>>>,
    required: true,
  },
});

const balanceError = ref<string>('');
const validateAmount = () => {
  if (userBalance.value && props.form.model.amount.value.value > userBalance.value.amount.amount) {
    balanceError.value = `${t('payout.AmountToHigh')}`;
  } else {
    balanceError.value = ''; // Clear error if valid
  }
};

watch(() => userBalance.value, () => {
  validateAmount();
});

watch(() => props.form.model.amount.value.value, () => {
  validateAmount();
});

const loadingBalance = ref<boolean>(false);

watch(() => props.form.model.user.value.value, () => {
  if (props.form.model.user.value.value.id) {
    loadingBalance.value = true;
    apiService.balance.getBalanceId(props.form.model.user.value.value.id).then((res) => {
      userBalance.value = res.data;
      loadingBalance.value = false;
    }).catch(() => {
      userBalance.value = undefined;
    });
  }
});

props.form.submit = props.form.context.handleSubmit(async (values) => {
  const request: PayoutRequestRequest = {
    amount: {
      amount: Math.round(values.amount * 100),
      precision: 2,
      currency: 'EUR',
    },
    bankAccountName: values.bankAccountName,
    bankAccountNumber: values.bankAccountNumber,
    forId: props.form.model.user.value.value.id,
  };
  await payoutStore.createPayout(request).then(() => {
    emit('submit:success', request);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.payoutCreate'),
      life: 3000,
    });
  }).catch((err) => {
    emit('submit:error', err);
    toast.add({
      severity: 'error',
      summary: t('errorMessages.error'),
      detail: err,
      life: 3000,
    });
  });
});

</script>

<style scoped lang="scss">

</style>
