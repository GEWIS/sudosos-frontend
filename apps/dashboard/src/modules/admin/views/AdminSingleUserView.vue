<template>
  <div class="page-container">
    <div class="page-title">{{ `${currentUser ? currentUser.firstName : ''}'s profile` }}</div>

    <div class="flex flex-column gap-5">
      <div class="flex flex-column  md:flex-row flex-wrap justify-content-between gap-5">
        <AdminUserInfoCard :user="currentUser"/>
        <AdminUserBalance :user="currentUser"/>
      </div>
      <CardComponent
          :header="t('transactions.recentTransactions')"
          class="w-full">
        <MutationsBalanceCard
            class="w-full"
            :header="t('userDetails.User Transactions')"
            paginator
            modal
            :get-mutations="getUserMutations"/>
      </CardComponent>
    </div>
  </div>
</template>s

<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import type { PaginatedFinancialMutationResponse, UserResponse } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import AdminUserBalance from "@/modules/admin/components/AdminUserBalance.vue";
import apiService from "@/services/ApiService";
import router from "@/router";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import type { AxiosError } from "axios";
import MutationsBalanceCard from "@/components/mutations/MutationsBalance.vue";
import AdminUserInfoCard from "@/modules/admin/components/users/AdminUserInfoCard.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();
const userStore = useUserStore();
const toast = useToast();
const currentUser: Ref<UserResponse | undefined> = ref();

onBeforeMount(async () => {
  await apiService.user.getIndividualUser(Number(route.params.userId)).then((res) => {
    currentUser.value = res.data;
  }).catch((error: AxiosError) => {
    handleError(error, toast);
  });
  if (!currentUser.value) {
    await router.replace({ path: '/error' });
    return;
  }
});

const getUserMutations = async (take: number, skip: number):
    Promise<PaginatedFinancialMutationResponse | undefined> => {
  await userStore.fetchUsersFinancialMutations(Number(route.params.userId), apiService, take, skip)
      .catch((err: AxiosError) => handleError(err, toast));
  return userStore.getCurrentUser.financialMutations;
};
</script>

<style scoped lang="scss">
</style>
