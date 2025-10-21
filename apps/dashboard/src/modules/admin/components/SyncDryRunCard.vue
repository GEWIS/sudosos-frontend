<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row gap-2 items-center justify-between">
      <span>{{ t('modules.admin.syncDryRun.title') }}</span>
      <Button
        :disabled="isRunning"
        :icon="isRunning ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
        :label="isRunning ? t('modules.admin.syncDryRun.running') : t('modules.admin.syncDryRun.run')"
        @click="runSyncDryRun"
      />
    </div>

    <!-- Loading Progress Bar -->
    <div v-if="isRunning" class="flex flex-col gap-2">
      <ProgressBar :value="progress" :show-value="false" />
      <span class="text-sm text-gray-600">{{
        t('modules.admin.syncDryRun.progress', { progress: Math.round(progress) })
      }}</span>
    </div>

    <!-- Results Section -->
    <div v-if="syncResults && !isRunning" class="flex flex-col gap-4">
      <div class="flex flex-row gap-4 text-sm">
        <span class="text-green-600">
          {{ t('modules.admin.syncDryRun.passed', { count: syncResults.users?.passed?.length || 0 }) }}
        </span>
        <span class="text-red-600">
          {{ t('modules.admin.syncDryRun.failed', { count: syncResults.users?.failed?.length || 0 }) }}
        </span>
        <span class="text-yellow-600">
          {{ t('modules.admin.syncDryRun.skipped', { count: syncResults.users?.skipped?.length || 0 }) }}
        </span>
      </div>

      <!-- Failed Users Table -->
      <div v-if="syncResults.users?.failed && syncResults.users.failed.length > 0" class="flex flex-col gap-2">
        <h4 class="text-lg font-semibold">{{ t('modules.admin.syncDryRun.failedUsers') }}</h4>
        <DataTable
          :value="paginatedFailedUsers"
          :rows="rowsPerPage"
          :total-records="syncResults.users.failed.length"
          paginator
          :rows-per-page-options="[10, 25, 50, 100]"
          lazy
          @page="onPageChange"
        >
          <Column field="id" :header="t('common.id')" />
          <Column field="firstName" :header="t('common.firstName')" />
          <Column field="lastName" :header="t('common.lastName')" />
          <Column field="type" :header="t('common.type')" />
        </DataTable>
      </div>

      <!-- No Failed Users Message -->
      <div
        v-else-if="syncResults.users?.failed && syncResults.users.failed.length === 0"
        class="text-green-600 text-center py-4"
      >
        {{ t('modules.admin.syncDryRun.noFailedUsers') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { DataTablePageEvent } from 'primevue/datatable';
import apiService from '@/services/ApiService';
import { GetUserSyncResultsServiceEnum } from '@sudosos/sudosos-client';

const { t } = useI18n();
const toast = useToast();

// State
const isRunning = ref(false);
const progress = ref(0);
const syncResults = ref<any>(null);
const currentPage = ref(0);
const rowsPerPage = ref(10);

// Progress simulation
let progressInterval: number | null = null;
const progressStartTime = ref<number>(0);
const totalDuration = 120000; // 2 minutes in milliseconds

// Computed
const paginatedFailedUsers = computed(() => {
  if (!syncResults.value?.users?.failed) return [];

  const start = currentPage.value * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return syncResults.value.users.failed.slice(start, end);
});

// Methods
const startProgressSimulation = () => {
  progress.value = 0;
  progressStartTime.value = Date.now();

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - progressStartTime.value;
    const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
    progress.value = Math.round(progressPercent);
  }, 100); // Update every 100ms for smooth animation
};

const stopProgressSimulation = () => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  progress.value = 100;
};

const runSyncDryRun = async () => {
  if (isRunning.value) return;

  isRunning.value = true;
  syncResults.value = null;

  try {
    startProgressSimulation();

    // Call the sync API - if it takes longer than 2 minutes, progress bar will just stay at 100%
    const result = await apiService.sync.getUserSyncResults('gewisdb' as GetUserSyncResultsServiceEnum);

    stopProgressSimulation();
    syncResults.value = result.data;

    toast.add({
      severity: 'success',
      summary: t('modules.admin.syncDryRun.completed'),
      detail: t('modules.admin.syncDryRun.completedDetail', {
        passed: syncResults.value.users?.passed?.length || 0,
        failed: syncResults.value.users?.failed?.length || 0,
        skipped: syncResults.value.users?.skipped?.length || 0,
      }),
      life: 5000,
    });
  } catch (error) {
    stopProgressSimulation();
    console.error('Sync dry run failed:', error);

    toast.add({
      severity: 'error',
      summary: t('modules.admin.syncDryRun.error'),
      detail: t('modules.admin.syncDryRun.errorDetail'),
      life: 5000,
    });
  } finally {
    isRunning.value = false;
  }
};

const onPageChange = (event: DataTablePageEvent) => {
  currentPage.value = event.page || 0;
  rowsPerPage.value = event.rows || 25;
};

// Cleanup
onUnmounted(() => {
  stopProgressSimulation();
});
</script>

<style scoped lang="scss"></style>
