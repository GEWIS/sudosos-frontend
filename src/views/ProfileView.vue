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
      <div class="col-6 md:col-6">
        <ChangeApiKeyComponent />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";
import ChangeInfoComponent from "@/components/ChangeInfoComponent.vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import UserInfoComponent from "@/components/UserInfoComponent.vue";
import type { UserResponse } from "@sudosos/sudosos-client";

const userStore = useUserStore();

const { current } = storeToRefs(userStore);
</script>

<style scoped lang="scss">
//@import "../styles/BasePage.css";
</style>
