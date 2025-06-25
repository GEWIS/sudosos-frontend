<template>
  <BalanceTopupModal v-model:visible="visible" :amount="topupAmount!!" />
  <CardComponent class="sm:w-full w-full" :header="t('modules.user.balance.balance')">
    <div class="flex flex-col sm:flex-row justify-center">
      <div class="flex flex-col justify-center w-27 sm:w-1/2">
        <div v-if="loading" class="flex justify-center">
          <Skeleton height="5rem" width="15rem" />
        </div>
        <h1 v-else class="font-medium my-0 sm:text-7xl text-5xl text-center">{{ displayBalance }}</h1>
        <p v-if="userBalance && userBalance.fine" class="font-semibold text-base text-center text-red-500">
          {{
            isAllFine
              ? t('modules.user.balance.allIsFines')
              : t('modules.user.balance.someIsFines', { fine: displayFine })
          }}
        </p>
        <div v-show="displayBalanceAfterTopup" class="font-italic text-600 text-center">
          {{ t('modules.user.balance.after') }}
          <span v-if="displayBalanceAfterTopup">{{
            formatPrice(
              Dinero(userBalance?.amount!! as Dinero.Options)
                .add(Dinero({ amount: Math.round(topupAmount!! * 100), currency: 'EUR' }))
                .toObject(),
            )
          }}</span>
        </div>
      </div>
      <Divider class="block sm:hidden" layout="horizontal" />
      <Divider class="hidden sm:block" layout="vertical" />
      <BalanceTopupForm :form="form" />
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import Divider from 'primevue/divider';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import BalanceTopupModal from '@/modules/user/components/balance/BalanceTopupModal.vue';
import CardComponent from '@/components/CardComponent.vue';
import { schemaToForm } from '@/utils/formUtils';
import { topupSchema } from '@/utils/validation-schema';
import BalanceTopupForm from '@/modules/user/components/forms/BalanceTopupForm.vue';
import { useUserBalance } from '@/composables/userBalance';

const { t } = useI18n();
const { userBalance, loading, isAllFine, displayFine, displayBalance } = useUserBalance();

const form = schemaToForm(topupSchema);

const visible = ref(false);
const loading: Ref<boolean> = ref(false);

const displayBalanceAfterTopup = computed(() => {
  return false;
  // return meta.value.touched && userBalance.value?.amount != undefined && topupAmount.value != undefined;
});
</script>
<style scoped lang="scss">
.invisible {
  visibility: hidden;
}
</style>
