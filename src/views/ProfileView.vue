<template>
  <div class="page-container">
    <div class="page-title my-0">
      {{ $t('profile.myProfile')}}
    </div>
    <div class="flex flex-row mb-2 align-items-center">
      <h3 class="mr-3">{{ $t('profile.individualDataAnalysis') }}</h3>
      <ToggleButton class="h-3rem" v-model="dataAnalysis" @update:modelValue="handleChange"></ToggleButton>
    </div>

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
import { computed, onMounted, type Ref, ref } from "vue";
import { UserRole } from "@/utils/rbacUtils";
import ToggleButton from "primevue/togglebutton";

const userStore = useUserStore();
const authStore = useAuthStore();
const isAdmin = computed(() => {
  return authStore.roles.includes(UserRole.BOARD);
});
const dataAnalysis: Ref<boolean> = ref(false);
const { current } = storeToRefs(userStore);

onMounted(async () => {
  dataAnalysis.value = authStore.user?.extensiveDataProcessing || false;
});

function handleChange(value: boolean) {
  // TODO: Once backend implements this, make the toggle function.
}
</script>

<style scoped lang="scss">
//@import "../styles/BasePage.css";
</style>
