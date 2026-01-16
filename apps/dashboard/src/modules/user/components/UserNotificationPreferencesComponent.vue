<template>
  <CardComponent :header="t('modules.user.notifications.header')">
    <div v-if="loading" class="flex justify-center p-4">
      <i class="pi pi-spin pi-spinner text-2xl" />
    </div>
    <div v-else class="flex flex-row items-center gap-3 w-full">
      <span class="my-0">{{ t('modules.user.notifications.transactionNotifications') }}</span>
      <Select
        v-model="transactionNotificationMode"
        class="flex-grow"
        option-label="label"
        :options="notificationModeOptions"
      >
        <template #option="slotProps">
          <span v-tooltip="getTooltipForOption(slotProps.option.value)">
            {{ slotProps.option.label }}
          </span>
        </template>
      </Select>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type {
  UserResponse,
  BaseUserNotificationPreferenceResponse,
  UserNotificationPreferenceUpdateRequest,
} from '@sudosos/sudosos-client';
import type { AxiosError } from 'axios';
import Select from 'primevue/select';
import CardComponent from '@/components/CardComponent.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const props = defineProps<{
  user: UserResponse;
}>();

const { t } = useI18n();
const toast = useToast();
const loading = ref(true);
const allPreferences = ref<BaseUserNotificationPreferenceResponse[]>([]);
const transactionNotificationSelfId = ref<number | null>(null);
const transactionNotificationChargedByOtherId = ref<number | null>(null);
const isInitializing = ref(true);

const NOTIFICATION_CHANNEL = 'EMAIL' as const;
const NOTIFICATION_TYPE_SELF = 'TransactionNotificationSelf' as const;
const NOTIFICATION_TYPE_OTHER = 'TransactionNotificationChargedByOther' as const;

type NotificationMode = 'disabled' | 'own' | 'other' | 'all';

interface NotificationModeOption {
  value: NotificationMode;
  label: string;
}

const notificationModeOptions = computed<NotificationModeOption[]>(() => [
  { value: 'disabled', label: t('modules.user.notifications.disabled') },
  { value: 'own', label: t('modules.user.notifications.own') },
  { value: 'other', label: t('modules.user.notifications.other') },
  { value: 'all', label: t('modules.user.notifications.all') },
]);

const getTooltipForOption = (value: NotificationMode): string => {
  const tooltipMap: Record<NotificationMode, string> = {
    disabled: t('modules.user.notifications.tooltip.disabled'),
    own: t('modules.user.notifications.tooltip.own'),
    other: t('modules.user.notifications.tooltip.other'),
    all: t('modules.user.notifications.tooltip.all'),
  };
  return tooltipMap[value] ?? '';
};

const findPreference = (
  type: typeof NOTIFICATION_TYPE_SELF | typeof NOTIFICATION_TYPE_OTHER,
): BaseUserNotificationPreferenceResponse | undefined => {
  return allPreferences.value.find((p) => p.type === type && p.channel === NOTIFICATION_CHANNEL);
};

const transactionNotificationMode = ref<NotificationModeOption | null>(null);

const fetchPreferences = async () => {
  loading.value = true;
  try {
    const res = await apiService.userNotifications.getAllUserNotificationPreferences(undefined, props.user.id);
    allPreferences.value = res.data.records || [];

    const selfPreference = findPreference(NOTIFICATION_TYPE_SELF);
    const otherPreference = findPreference(NOTIFICATION_TYPE_OTHER);

    transactionNotificationSelfId.value = selfPreference?.id ?? null;
    transactionNotificationChargedByOtherId.value = otherPreference?.id ?? null;

    updateTransactionNotificationMode();
    isInitializing.value = false;
  } catch (err) {
    handleError(err as AxiosError, toast);
    isInitializing.value = false;
  } finally {
    loading.value = false;
  }
};

const updateTransactionNotificationMode = () => {
  const selfPreference = findPreference(NOTIFICATION_TYPE_SELF);
  const otherPreference = findPreference(NOTIFICATION_TYPE_OTHER);

  const selfEnabled = selfPreference?.enabled === true;
  const otherEnabled = otherPreference?.enabled === true;

  const modeMap: Record<string, NotificationMode> = {
    'false-false': 'disabled',
    'true-false': 'own',
    'false-true': 'other',
    'true-true': 'all',
  };

  const modeKey = `${selfEnabled}-${otherEnabled}`;
  const mode = modeMap[modeKey] ?? 'disabled';
  transactionNotificationMode.value = notificationModeOptions.value.find((opt) => opt.value === mode) ?? null;
};

const handleTransactionNotificationChange = async (mode: NotificationModeOption) => {
  const selfEnabled = mode.value === 'own' || mode.value === 'all';
  const otherEnabled = mode.value === 'other' || mode.value === 'all';

  const updatePromises: Promise<unknown>[] = [];

  if (transactionNotificationSelfId.value !== null) {
    const updateRequest = {
      enabled: selfEnabled,
    } as UserNotificationPreferenceUpdateRequest;
    updatePromises.push(
      apiService.userNotifications.updateUserNotificationPreference(transactionNotificationSelfId.value, updateRequest),
    );
  }

  if (transactionNotificationChargedByOtherId.value !== null) {
    const updateRequest = {
      enabled: otherEnabled,
    } as UserNotificationPreferenceUpdateRequest;
    updatePromises.push(
      apiService.userNotifications.updateUserNotificationPreference(
        transactionNotificationChargedByOtherId.value,
        updateRequest,
      ),
    );
  }

  if (updatePromises.length === 0) {
    return;
  }

  try {
    await Promise.all(updatePromises);

    const selfPreference = findPreference(NOTIFICATION_TYPE_SELF);
    const otherPreference = findPreference(NOTIFICATION_TYPE_OTHER);

    if (selfPreference) {
      selfPreference.enabled = selfEnabled;
    }
    if (otherPreference) {
      otherPreference.enabled = otherEnabled;
    }

    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('modules.user.notifications.preferencesUpdated'),
      life: 3000,
    });
  } catch (err) {
    handleError(err as AxiosError, toast);
    updateTransactionNotificationMode();
  }
};

watch(transactionNotificationMode, (newMode, oldMode) => {
  if (newMode && !isInitializing.value && oldMode !== null && oldMode !== undefined) {
    void handleTransactionNotificationChange(newMode);
  }
});

onMounted(() => {
  void fetchPreferences();
});
</script>
