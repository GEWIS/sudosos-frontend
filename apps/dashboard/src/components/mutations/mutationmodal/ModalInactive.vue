<template>
  <Dialog
    ref="dialog"
    :draggable="false"
    :header="t('components.mutations.modal.header', { id })"
    modal
    :pt="{
      root: { class: 'w-full max-w-[90vw] md:max-w-[33rem]' },
    }"
    :visible="visible"
    @hide="emit('close')"
    @show="addListenerOnDialogueOverlay(dialog)"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="isLoading">
      <Skeleton class="h-2rem my-1 surface-300 w-5" />
      <Skeleton class="h-2rem my-1 surface-300 w-10" />
      <br />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
      <Skeleton class="h-2rem my-1 surface-300 w-11" />
    </div>

    <InactiveDetailModal v-else-if="inactiveInfo" :inactive-info="inactiveInfo" />

    <template v-if="canDelete" #footer>
      <div class="items-end flex gap-2">
        <div class="flex justify-end">
          <ConfirmButton
            :disabled="false"
            icon="pi pi-trash"
            :initial-label="t('common.delete')"
            type="submit"
            @confirm="deleteInactive"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { addListenerOnDialogueOverlay, isAllowed } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Skeleton from 'primevue/skeleton';
import type { BaseInactiveAdministrativeCostResponse } from '@sudosos/sudosos-client';
import ConfirmButton from '@/components/ConfirmButton.vue';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';
import InactiveDetailModal from '@/components/mutations/mutationmodal/ModalDetailInactive.vue';

interface Props {
  id: number;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  close: [];
  delete: [id: number];
}>();

const { t } = useI18n();
const store = useAdministrativeCostsStore();
const toast = useToast();

const dialog = ref();
const inactiveInfo = ref<BaseInactiveAdministrativeCostResponse | null>(null);
const isLoading = ref(false);

const canDelete = computed(() => isAllowed('delete', ['all'], 'InactiveAdministrativeCost', ['any']));

async function fetchInactive() {
  if (!props.id) return;
  isLoading.value = true;
  try {
    inactiveInfo.value = await store.fetchCost(props.id);
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => [props.visible, props.id],
  ([newVisible, newId]) => {
    if (newVisible && newId) {
      void fetchInactive();
    } else if (!newVisible) {
      inactiveInfo.value = null;
    }
  },
  { immediate: true },
);

async function deleteInactive() {
  if (!inactiveInfo.value) return;

  try {
    await store.deleteCost(inactiveInfo.value.id);
    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('modules.financial.administrative.deleteSuccess'),
      severity: 'success',
      life: 3000,
    });
    dialog.value?.close();
    emit('delete', inactiveInfo.value.id);
    emit('update:visible', false);
  } catch (err) {
    console.error(err);
    toast.add({
      summary: t('common.toast.error.error'),
      detail: t('modules.financial.administrative.deleteError'),
      severity: 'error',
      life: 3000,
    });
  }
}
</script>

<style scoped lang="scss"></style>
