<template>
  <form autocomplete="new-password" class="flex flex-col gap-2 justify-between" @submit.prevent="() => form.submit()">
    <!-- Prevent aggressive firefox autocomplete -->
    <input hidden type="password" />
    <InputSpan
      id="pin"
      v-bind="form.model.pin.attr.value"
      autocomplete="off"
      class="max-w-[3.5rem]"
      :disabled="!edit"
      :errors="form.context.errors.value.pin"
      :label="t('modules.user.profile.pinNew')"
      type="pin"
      :value="form.model.pin.value.value || ''"
      @update:value="form.context.setFieldValue('pin', $event)"
    />
    <InputSpan
      id="pinConfirm"
      v-bind="form.model.pinConfirm.attr.value"
      class="max-w-[3.5rem]"
      :disabled="!edit"
      :errors="form.context.errors.value.pinConfirm"
      :label="t('modules.user.profile.pinConfirm')"
      type="pin"
      :value="form.model.pinConfirm.value.value"
      @update:value="form.context.setFieldValue('pinConfirm', $event)"
    />
    <button class="hidden" type="submit" />
  </form>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import type { PropType } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import type { editPinSchema } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof editPinSchema>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const emit = defineEmits(['submit:success', 'submit:error']);

setSubmit<yup.InferType<typeof editPinSchema>>(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (userStore.getCurrentUser.user) {
      apiService.user
        .updateUserPin(userStore.getCurrentUser.user.id, { pin: values.pinConfirm })
        .then(() => {
          emit('submit:success', values);
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.pinUpdated')}`,
            life: 3000,
          });
          props.form.context.resetForm();
        })
        .catch((err) => {
          emit('submit:error', err);
          handleError(err, toast);
        });
    }
  }),
);
</script>

<style scoped lang="scss"></style>
