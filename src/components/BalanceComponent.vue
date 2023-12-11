<template>
  <CardComponent
      :header="$t('c_currentBalance.balance')"
      :action="showOption ? $t('c_currentBalance.Increase balance') : ''"
      routerLink="balance"
  >
    <div class="flex flex-column justify-content-center">
      <h1>{{ displayBalance }}</h1>
      <p class="text-center text-base font-semibold" v-if="fine">{{`Of which ${fine} is fines`}}</p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref, onMounted, Ref } from "vue";
import type { UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";

const props = defineProps({
  user: {
    type: Object as () => UserResponse,
    required: false
  },
  showOption: {
    type: Boolean,
    required: true,
  }
});

const userStore = useUserStore();

const balanceFromApi = ref<string | undefined>(undefined);
const fine: Ref<string | undefined> = ref();
onMounted(async () => {
  if (props.user) {
    const response = await apiService.balance.getBalanceId(props.user.id);
    balanceFromApi.value = formatPrice(response.data.amount);
    fine.value = response.data.fine ?
      formatPrice(response.data.fine) : undefined;
  }
});

const displayBalance = computed(() => {
  if (props.user) {
    return balanceFromApi.value;
  } else {
    const balanceInCents = userStore.getCurrentUser.balance;
    if (userStore.getCurrentUser.balance && userStore.getCurrentUser.balance.fine){
      fine.value = formatPrice(userStore.getCurrentUser.balance?.fine || { amount: 0, currency: 'EUR', precision: 2 });
    }
    if (!balanceInCents) return undefined;
    const balanceInEuros = (balanceInCents.amount.amount / 100).toFixed(2);
    return `€${balanceInEuros}`;
  }
});


</script>

<style scoped lang="scss">
h1 {
  font-size: 50px;
  text-align: center;
  font-family: Raleway, sans-serif !important;
  font-weight: 500;
}

p {
  color: #d40000;
  font-family: Raleway, sans-serif !important;
}
</style>
