<template>
  <TopupModal v-model:visible="visible" :amount="topupAmount!!" />
  <CardComponent :header="$t('c_currentBalance.balance')">
    <div class="flex flex-column justify-content-center">
      <h1 class="text-center font-medium text-6xl my-0">{{ displayBalance }}</h1>
      <p class="text-center text-base font-semibold text-red-500" v-if="userBalance && userBalance.fine">
        {{ isAllFine ? $t('c_currentBalance.allIsFines') : $t('c_currentBalance.someIsFines', { fine: displayFine }) }}
      </p>
    </div>
    <div>
      <p class="font-bold">{{ $t('balance.Balance increase amount') }}</p>
      <div class="w-3 flex-1">

        <InputNumber v-model="topupAmount" v-bind="topupAmountAttrs" :inputProps="{
            inputmode: 'numeric',
          }" @input="(test) => {
            setFieldValue('Top up amount', test.value as number, errors['Top up amount'] != undefined);
            setTouched(true)
          }" :placeholder="$t('balance.Price')" inputId="amount" mode="currency" currency="EUR" locale="nl-NL" />
      </div>
      <span class="font-bold text-red-500">{{ errors['Top up amount'] }}</span>
    </div>
    <br />
    <div class="flex justify-content-end">
      <Button @click="onSubmit" :disabled="topupAmount == null">
        {{ $t('balance.Start payment') }}
      </Button>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import TopupModal from "@/components/TopupModalComponent.vue";
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref, onMounted, type Ref, watch } from "vue";
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from '@vee-validate/yup';

const productSchema = toTypedSchema(
  yup.object({
    'Top up amount': yup.number().required().test(
      'is-min10-or-balance',
      `Top up should be more than €10 or settle debt exactly.`,
      (value) => {
        return value >= 10 || value*-100 == userBalance.value?.amount.amount
      }
    ),
  })
);

const { 
  values, 
  errors, 
  defineField, 
  meta, 
  setFieldValue,
  setTouched,
  handleSubmit
} = useForm({
  validationSchema: productSchema
})

const [topupAmount, topupAmountAttrs] = defineField('Top up amount', {
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
  validateOnBlur: false
});

const onSubmit = handleSubmit((values) => {
  visible.value = true
})

const props = defineProps({
  user: {
    type: Object as () => UserResponse,
    required: false
  }
});

const userStore = useUserStore();
const userBalance: Ref<BalanceResponse | null> = ref(null);
const { current } = storeToRefs(userStore);
const router = useRouter();
const updateUserBalance = async () => {
  if (props.user) {
    const response = await apiService.balance.getBalanceId(props.user.id);
    userBalance.value = response.data;
  } else {
    // Force refresh balance, since people tend to refresh pages like this to ensure an up to date balance.
    const auth = useAuthStore();
    if (!auth.getUser){
      await router.replace({ path: '/error' });
      return;
    }
    await userStore.fetchCurrentUserBalance(auth.getUser.id, apiService);
    userBalance.value = userStore.getCurrentUser.balance;
  }
};

onMounted(updateUserBalance);

watch(() => props.user, () => {
  updateUserBalance();
});

watch(current, () => {
  updateUserBalance();
});

const isAllFine = computed(() => {
  if (!userBalance.value?.fine) return false;
  return userBalance.value.fine.amount >= -1*userBalance.value?.amount.amount;
});

const displayFine = computed(() => {
  if (!userBalance.value?.fine) return undefined;
  return formatPrice(userBalance.value.fine || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayBalance = computed(() => {
  return formatPrice(userBalance.value?.amount || { amount: 0, currency: 'EUR', precision: 2 });
});

// Define the 'visible' ref variable to control dialog visibility
const visible = ref(false);


onMounted(async () => {
  if (!userStore.getCurrentUser.user) {
    await router.replace({ path: '/error' });
    return;
  }
  await userStore.fetchCurrentUserBalance(userStore.getCurrentUser.user.id, apiService);
  if (!userStore.getCurrentUser.balance?.amount) {
    await router.replace({ path: '/error' });
    return;
  }
  userBalance.value = userStore.getCurrentUser.balance;
  console.warn(userBalance.value);
});
</script>
<style scoped lang="scss">

</style>
