<template>
  <BalanceTopupModal v-model:visible="visible" :amount="topupAmount!!" />
  <CardComponent :header="t('modules.user.balance.balance')" class="w-full sm:w-full">
    <div class="flex flex-row justify-content-center">
      <div class="flex flex-column justify-content-center w-6">
        <Skeleton v-if="loading" class="h-4rem w-5 mx-auto" />
        <h1 v-else class="text-center font-medium text-5xl sm:text-7xl my-0">{{ displayBalance }}</h1>
        <p class="text-center text-base font-semibold text-red-500" v-if="userBalance && userBalance.fine">
          {{
          isAllFine
          ? t('modules.user.balance.allIsFines')
          : t('modules.user.balance.someIsFines', { fine: displayFine })
          }}
        </p>
        <div v-show="displayBalanceAfterTopup" class="text-center text-600 font-italic">
          {{ t('modules.user.balance.after') }}
          <span v-if="displayBalanceAfterTopup">{{
            formatPrice(
            Dinero(userBalance?.amount!! as Dinero.Options)
            .add(Dinero({ amount: Math.round(topupAmount!! * 100), currency: 'EUR' }))
            .toObject()
            )
            }}</span>
        </div>
      </div>
      <Divider layout="vertical" />

      <div class="flex flex-column w-6">
        <div>
          <p class="font-bold">{{ t('modules.user.balance.increaseAmount') }}</p>
          <div class="w-full flex-1">
            <InputNumber
                mode="currency"
                currency="EUR"
                locale="nl-NL"
                :placeholder="t('modules.user.balance.price')"
                :min="0.0"
                :min-fraction-digits="0"
                :max-fraction-digits="2"
                v-model="topupAmount"
                inputId="amount"
                @input="
                (data) => {
                  setFieldValue(
                    'Top up amount',
                    data.value as number,
                    errors['Top up amount'] !== undefined
                  );
                  setTouched(true);
                }
              "
              :inputProps="{
                inputmode: 'decimal',
                class: 'w-full'
              }" />
          </div>
          <span class="font-bold text-red-500">{{ errors['Top up amount'] }}</span>
        </div>
        <div class="flex justify-content-end my-2">
          <Button @click="onSubmit" class="w-full sm:w-4 justify-content-center">
            {{ t('modules.user.balance.topUp') }}
          </Button>
        </div>
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import BalanceTopupModal from '@/modules/user/components/balance/BalanceTopupModal.vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref, onMounted, type Ref, watch } from 'vue';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from '@/utils/formatterUtils';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';
import Divider from 'primevue/divider';
import Dinero from 'dinero.js';
import InputNumber from 'primevue/inputnumber';
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading: Ref<boolean> = ref(true);
const productSchema = toTypedSchema(
  yup.object({
    'Top up amount': yup
      .number()
      .required()
      .test(
        'is-min10-or-balance',
        `Top up should be more than €10 or settle debt exactly.`,
        (value) => {
          return value >= 10 || Math.round(value * -100) == userBalance.value?.amount.amount;
        }
      )
      .test(
        'is-total-less-than-150',
        `Your new balance cannot surpass €150.`,
        (value) => {
          return userBalance.value!!.amount.amount + value*100 <= 15000;
        }
      )
  })
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { values, errors, defineField, meta, setFieldValue, setTouched, handleSubmit, validate } =
  useForm({
    validationSchema: productSchema
  });

const [topupAmount] = defineField('Top up amount', {
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false
});

const onSubmit = handleSubmit(() => {
  visible.value = true;
});

const userStore = useUserStore();
const userBalance: Ref<BalanceResponse | null> = ref(null);
const router = useRouter();
const updateUserBalance = async () => {
  // Force refresh balance, since people tend to refresh pages like this to ensure an up to date balance.
  loading.value = true;
  const auth = useAuthStore();
  if (!auth.getUser) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchCurrentUserBalance(auth.getUser.id, apiService);
  userBalance.value = userStore.getCurrentUser.balance;
  loading.value = false;
};

onMounted(() => {
  setTimeout(updateUserBalance, 1000);
});

watch(userStore, () => {
  loading.value = true;
  userBalance.value = userStore.getCurrentUser.balance;
  loading.value = false;
});

const isAllFine = computed(() => {
  if (!userBalance.value?.fine) return false;
  return userBalance.value.fine.amount >= -1 * userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(userBalance.value.fine || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalanceAfterTopup = computed(() => {
  return (
    meta.value.touched && userBalance.value?.amount != undefined && topupAmount.value != undefined
  );
});

// Define the 'visible' ref variable to control dialog visibility
const visible = ref(false);
</script>
<style scoped lang="scss">
.invisible {
  visibility: hidden;
}
</style>
