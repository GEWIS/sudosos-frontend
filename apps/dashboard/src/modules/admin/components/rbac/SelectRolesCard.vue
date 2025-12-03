<template>
  <CardComponent class="w-full" :header="t('modules.admin.rbac.selection.title')">
    <!-- TODO: Improve two way binding such that resetting the form will also reset the user selection -->
    <InputRoleSpan
      v-model:value="selectedRole"
      class="mb-3"
      :label="t('modules.admin.rbac.selection.label')"
      :placeholder="t('modules.admin.rbac.selection.title')"
      @update:value="updateRole($event)"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import type { RoleResponse } from '@sudosos/sudosos-client';
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import apiService from '@/services/ApiService';
import CardComponent from '@/components/CardComponent.vue';
import InputRoleSpan from '@/components/InputRoleSpan.vue';
import { rbacSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import { handleError } from '@/utils/errorUtils';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});

const { t } = useI18n();

const currentPermissions = ref<any>([]);
const currentUsers = ref<any>([]);
const selectedRole = ref<RoleResponse | undefined>(undefined);

const updateRole = (event: RoleResponse) => {
  console.error('Role changed', event);
  props.form.context.setFieldValue('id', event.id);
  props.form.context.setFieldValue('name', event.name);
  props.form.context.setFieldValue('systemDefault', event.systemDefault);
  updatePermissions(event.id);
  updateUsers(event.id);
};

function updatePermissions(id: number) {
  apiService.rbac
    .getSingleRole(id)
    .then((response) => {
      currentPermissions.value = response.data.permissions;
      props.form.context.setFieldValue('permissions', currentPermissions.value);
      props.form.context.setFieldValue('currentPermission', response.data.permissions[0]);
    })
    .catch(() => {
      currentPermissions.value = [];
    });
}

function updateUsers(id: number) {
  let systemDefault = false;
  apiService.rbac
    .getSingleRole(id)
    .then((res) => {
      systemDefault = res.data.systemDefault;
    })
    .catch((err) => {
      handleError(err, useToast());
    });
  if (!systemDefault) {
    apiService.rbac
      .getRoleUsers(id)
      .then((res) => {
        currentUsers.value = res.data.records;
        props.form.context.setFieldValue('users', currentUsers.value);
      })
      .catch((err) => {
        handleError(err, useToast());
      });
  } else {
    currentUsers.value = [];
    props.form.context.setFieldValue('users', currentUsers.value);
  }
}
</script>

<style scoped lang="scss"></style>
