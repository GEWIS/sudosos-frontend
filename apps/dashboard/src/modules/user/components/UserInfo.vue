<template>
  <CardComponent :header="t('components.general.quickOverview.header')">
    <div class="@container">
      <div class="flex flex-col-reverse @sm:flex-row @sm:justify-center items-center gap-2">
        <span class="text-2xl font-bold text-center"> {{ props.user.firstName }} {{ props.user.lastName }} </span>
        <span class="text-2xl text-center font-mono font-semibold text-gray-500">
          {{ isGewisUser(props.user) ? props.user.gewisId : `E${props.user.id}` }}
        </span>
      </div>
      <p v-if="!props.user.ofAge" class="font-bold text-center text-red-500 mt-2">
        {{ t('components.general.quickOverview.underAge') }}
      </p>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import type { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';

const { t } = useI18n();

const props = defineProps({
  user: {
    type: Object as () => UserResponse | GewisUserResponse,
    required: true,
  },
});

// Type guard
function isGewisUser(user: UserResponse | GewisUserResponse): user is GewisUserResponse {
  return (user as GewisUserResponse).gewisId !== undefined;
}
</script>
