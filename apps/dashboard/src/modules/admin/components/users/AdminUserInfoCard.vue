<template>
  <FormCard
    :enable-edit="true"
    :header="t('modules.admin.singleUser.userInfo.header')"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <UserEditForm :edit="edit" :form="form" :user="props.user" @update:edit="edit = $event" />
      <Divider />
      <h4 class="mt-0">{{ t('modules.user.settings.nfc') }}</h4>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.changeNFC') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="startScan()" />
      </div>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.deleteNFC') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmDeleteNFC()" />
      </div>

      <Divider />
      <h4 class="mt-0">{{ t('modules.user.settings.apiKeys') }}</h4>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.changeApiKey') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmChangeApiKey()" />
      </div>
      <div class="items-center flex flex-row w-full">
        <p class="flex-grow-1 my-1">{{ t('modules.user.settings.deleteApiKey') }}</p>
        <i class="items-center cursor-pointer flex pi pi-arrow-up-right text-gray-500" @click="confirmDeleteApiKey()" />
      </div>
    </div>
  </FormCard>
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from 'vue';
import type { UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import FormCard from '@/components/FormCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { updateUserDetailsObject } from '@/utils/validation-schema';
import UserEditForm from '@/modules/admin/components/users/forms/UserEditForm.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const confirm = useConfirm();
const userStore = useUserStore();
const toast = useToast();

async function startScan() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (!('NDEFReader' in window)) {
    let detail;
    if (isIOS) {
      detail = t('common.toast.error.iosUnsupported');
    } else if (isAndroid) {
      detail = t('common.toast.error.androidUnsupported');
    } else {
      detail = t('common.toast.error.desktopUnsupported');
    }

    toast.add({
      severity: 'error',
      summary: t('common.toast.error.error'),
      detail: detail,
      life: 3000,
    });
  }

  const ndef = new window.NDEFReader();
  await ndef.scan().then(() => {
    toast.add({
      severity: 'info',
      summary: t('common.toast.info.info'),
      detail: t('common.toast.info.scanStarted'),
      life: 3000,
    });
  });

  // Handle the NFC tag when it is detected
  ndef.onreading = async (event: NDEFReadingEvent) => {
    // Extract and log the NFC tag's ID (serial number)
    const nfcCode = event.serialNumber.toLowerCase().replace(/[^a-z0-9]/g, '');

    await apiService.user
      .updateUserNfc(props.user.id, { nfcCode })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.nfcCodeUpdated'),
          life: 3000,
        });
      })
      .catch((err) => {
        handleError(err, toast);
      });
  };
}

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
});

const edit = ref(false);

const form = schemaToForm(updateUserDetailsObject);

const formSubmit = () => {
  void form.submit();
};

const updateFieldValues = (p: UserResponse) => {
  if (!p) return;
  const values = {
    ...p,
    userType: p.type,
    isActive: p.active,
  };
  form.context.resetForm({ values });
};

watch(
  () => props.user,
  (newValue: UserResponse) => {
    updateFieldValues(newValue);
  },
);

onMounted(() => {
  if (props.user) {
    updateFieldValues(props.user);
  }
});

const confirmChangeApiKey = () => {
  confirm.require({
    message: t('modules.user.settings.confirmChangeApiKey'),
    header: t('modules.user.settings.changeApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      userStore
        .fetchUserApi(apiService, props.user.id)
        .then((res) => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.apiKeyChanged')} \n ${res.data.key}`,
            life: 5000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
};

const confirmDeleteApiKey = () => {
  confirm.require({
    message: t('modules.user.settings.confirmDeleteApiKey'),
    header: t('modules.user.settings.deleteApiKey'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user
        .deleteUserKey(props.user.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.apiKeyDeleted'),
            life: 5000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
};

const confirmDeleteNFC = () => {
  confirm.require({
    message: t('modules.user.settings.confirmDeleteNFC'),
    header: t('modules.user.settings.deleteNFC'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      apiService.user
        .deleteUserNfc(props.user.id)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.nfcCodeDeleted'),
            life: 5000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
          console.error(err.message);
        });
    },
  });
};
</script>

<style scoped lang="scss"></style>
