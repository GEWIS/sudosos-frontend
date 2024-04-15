<template>
  <div class="page-container">
    <div class="page-title">{{ $t('profile.myProfile')}}</div>
    <div class="grid">
      <div class="col-6 md:col-6">
        <UserInfoComponent :user="current.user as UserResponse"/>
      </div>
      <div class="col-6 md:col-6">
          <ChangePinComponent />
      </div>
      <div class="col-6 md:col-6">
        <ChangePasswordComponent />
      </div>
      <div class="col-6 md:col-6" v-if="isAdmin">
        <ChangeApiKeyComponent />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";
import { useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import UserInfoComponent from "@/components/UserInfoComponent.vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { computed } from "vue";
import { UserRole } from "@/utils/rbacUtils";

const userStore = useUserStore();
const authStore = useAuthStore();
const isAdmin = computed(() => {
  return authStore.roles.includes(UserRole.BOARD);
});
const { current } = storeToRefs(userStore);
</script>

<style scoped lang="scss">
//@import "../styles/BasePage.css";
</style>
