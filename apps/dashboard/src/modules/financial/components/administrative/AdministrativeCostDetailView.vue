<template>
  <Dialog
    :visible="visible"
    :header="t('modules.financial.administrative.details.title')"
    modal
    :style="{ width: '50rem' }"
    @hide="handleHide"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="isLoading" class="flex flex-col gap-3">
      <Skeleton class="w-full h-3rem" />
      <Skeleton class="w-full h-3rem" />
      <Skeleton class="w-full h-3rem" />
    </div>

    <div v-else-if="cost" class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ t('modules.financial.administrative.details.basicInfo') }}</div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.id') }}:</span>
          <span>{{ cost.id }}</span>
        </div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.createdAt') }}:</span>
          <span>{{ formatDateFromString(cost.createdAt) }}</span>
        </div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.updatedAt') }}:</span>
          <span>{{ formatDateFromString(cost.updatedAt) }}</span>
        </div>
      </div>

      <Divider />

      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ t('modules.financial.administrative.details.userInfo') }}</div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.name') }}:</span>
          <UserLink :user="cost.from" />
        </div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.id') }}:</span>
          <span>{{ cost.from.id }}</span>
        </div>
      </div>

      <Divider />

      <div class="flex flex-col gap-2">
        <div class="font-bold">{{ t('modules.financial.administrative.details.financialInfo') }}</div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.amount') }}:</span>
          <span>{{ formatDineroObject(cost.amount) }}</span>
        </div>
      </div>

      <Divider v-if="cost.transfer" />

      <div v-if="cost.transfer" class="flex flex-col gap-2">
        <div class="font-bold">{{ t('modules.financial.administrative.details.transferInfo') }}</div>
        <div class="flex flex-row justify-content-between">
          <span>{{ t('common.id') }}:</span>
          <span>{{ cost.transfer.id }}</span>
        </div>
        <div v-if="cost.transfer.description" class="flex flex-row justify-content-between">
          <span>{{ t('common.description') }}:</span>
          <span>{{ cost.transfer.description }}</span>
        </div>
        <div v-if="cost.transfer.createdAt" class="flex flex-row justify-content-between">
          <span>{{ t('common.date') }}:</span>
          <span>{{ formatDateFromString(cost.transfer.createdAt) }}</span>
        </div>
      </div>

      <Divider />

      <div class="flex flex-row justify-content-end gap-2">
        <Button :label="t('common.delete')" severity="danger" @click="handleDelete" />
        <Button :label="t('common.close')" outlined @click="emit('close')" />
      </div>
    </div>

    <div v-else class="text-center p-4">
      {{ t('modules.financial.administrative.details.notFound') }}
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BaseInactiveAdministrativeCostResponse } from '@sudosos/sudosos-client';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import { formatDateFromString, formatDineroObject } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';

interface Props {
  costId?: number;
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  delete: [id: number];
  'update:visible': [value: boolean];
}>();

const { t } = useI18n();
const store = useAdministrativeCostsStore();

const cost = ref<BaseInactiveAdministrativeCostResponse | null>(null);
const isLoading = ref(false);

watch(
  () => [props.visible, props.costId],
  async ([newVisible, newCostId]) => {
    if (newVisible && newCostId) {
      await loadCost(newCostId);
    } else if (!newVisible) {
      cost.value = null;
    }
  },
  { immediate: true },
);

async function loadCost(id: number) {
  isLoading.value = true;
  try {
    cost.value = await store.fetchCost(id);
  } finally {
    isLoading.value = false;
  }
}

function handleDelete() {
  if (cost.value) {
    emit('delete', cost.value.id);
  }
}

function handleHide() {
  emit('update:visible', false);
  emit('close');
}
</script>

<style scoped lang="scss"></style>
