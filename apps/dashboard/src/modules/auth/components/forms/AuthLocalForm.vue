<template>
  <form autocomplete="off" class="flex flex-col gap-7" @submit.prevent="() => form.submit()">
    <InputSpan
      id="username"
      v-bind="form.model.username.attr.value"
      column
      :disabled="false"
      :errors="form.context.errors.value.username"
      inline-error
      :label="t('modules.auth.login.username')"
      :placeholder="t('modules.auth.login.username')"
      type="text"
      :value="form.model.username.value.value"
      @update:value="form.context.setFieldValue('username', $event)"
    />

    <InputSpan
      id="password"
      v-bind="form.model.password.attr.value"
      column
      :disabled="false"
      :errors="form.context.errors.value.password"
      inline-error
      :label="t('modules.auth.login.password')"
      :placeholder="t('modules.auth.login.password')"
      type="password"
      :value="form.model.password.value.value"
      @update:value="form.context.setFieldValue('password', $event)"
    />
    <Button id="login-button" class="items-center flex justify-center mx-auto w-full" type="submit">
      {{ t('modules.auth.login.login') }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { AxiosError } from 'axios';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import type { localAuthForm } from '@/utils/validation-schema';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const authStore = useAuthStore();
const toast = useToast();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof localAuthForm>>>,
    required: true,
  },
});

const toHomeView = async () => {
  await router.push(sessionStorage.getItem('fromPath') || { name: 'home' }).catch(console.error);
  sessionStorage.removeItem('fromPath');
};

const onSuccess = async () => {
  if (authStore.getToS === 'ACCEPTED' && authStore.getUser) {
    await toHomeView();
  } else {
    await router.replace({ path: '/error' });
  }
};

const onError = (err: unknown) => {
  handleError(err as AxiosError, toast);
};

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (values.username.includes('@')) {
      authStore.localLogin(values.username, values.password, apiService).then(onSuccess).catch(onError);
    } else {
      authStore.gewisLdapLogin(values.username, values.password, apiService).then(onSuccess).catch(onError);
    }
  }),
);
</script>

<style scoped lang="scss"></style>
