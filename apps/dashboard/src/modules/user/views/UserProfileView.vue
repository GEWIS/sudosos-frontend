<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('modules.user.profile.title') }}</div>
    <div class="block md:hidden mb-4">
      <UserInfo :user="gewisUser || (current.user as GewisUserResponse)" />
    </div>
    <div class="flex flex-col md:flex-row gap-8">
      <div class="flex flex-col gap-4 flex-1">
        <UserPinComponent />
        <UserSettingsComponent :user="current.user as UserResponse" />
      </div>
      <div class="hidden md:flex justify-center md:justify-start items-start flex-1">
        <UserInfo class="self-start shrink-0" :user="gewisUser || (current.user as GewisUserResponse)" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { type StoreGeneric, storeToRefs } from 'pinia';
import type { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { onMounted, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import apiService from '@/services/ApiService';
import router from '@/router';
import UserSettingsComponent from '@/modules/user/components/UserSettingsComponent.vue';
import UserInfo from '@/modules/user/components/UserInfo.vue';
import PageContainer from '@/layout/PageContainer.vue';
import UserPinComponent from '@/modules/user/components/UserPinComponent.vue';

const userStore = useUserStore();
const { t } = useI18n();

const { current } = storeToRefs(userStore as StoreGeneric);
const gewisUser: Ref<GewisUserResponse | undefined> = ref(undefined);

onMounted(async () => {
  if (!userStore.current.user) {
    await router.replace({ path: '/error' });
    return;
  }
  gewisUser.value = await userStore.fetchGewisUser(userStore.current.user.id, apiService);
});
</script>
<style scoped lang="scss"></style>
