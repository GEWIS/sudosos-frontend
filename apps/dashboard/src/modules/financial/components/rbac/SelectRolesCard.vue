<!--<template>-->
<!--  <CardComponent :header="t('modules.financial.rbac.selection.title')">-->
<!--    &lt;!&ndash; TODO: Improve two way binding such that resetting the form will also reset the user selection &ndash;&gt;-->
<!--    <InputRoleSpan-->
<!--      :label="t('modules.financial.rbac.selection.label')"-->
<!--      @update:value="updateRole($event)"-->
<!--      v-model:value="selectedRole"-->
<!--      class="mb-3"-->
<!--      :placeholder="t('modules.financial.rbac.selection.title')"-->
<!--    />-->
<!--  </CardComponent>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import CardComponent from '@/components/CardComponent.vue';-->
<!--import apiService from '@/services/ApiService';-->
<!--import type { RoleResponse } from '@sudosos/sudosos-client';-->
<!--import { ref, type PropType } from 'vue';-->
<!--import { useI18n } from 'vue-i18n';-->
<!--import * as yup from 'yup';-->
<!--import { rbacSchema } from '@/utils/validation-schema';-->
<!--import { type Form } from '@/utils/formUtils';-->

<!--const props = defineProps({-->
<!--  form: {-->
<!--    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,-->
<!--    required: true,-->
<!--  },-->
<!--});-->

<!--const { t } = useI18n();-->

<!--const currentPermissions = ref<any>([]);-->
<!--const selectedRole = ref<RoleResponse | undefined>(undefined);-->

<!--const updateRole = (event: RoleResponse) => {-->
<!--  props.form.context.setFieldValue('id', event.id);-->
<!--  props.form.context.setFieldValue('name', event.name);-->
<!--  props.form.context.setFieldValue('systemDefault', event.systemDefault);-->
<!--  updatePermissions(event.id);-->
<!--  updateUsers();-->
<!--};-->

<!--function updatePermissions(id: number) {-->
<!--  apiService.rbac-->
<!--    .getSingleRole(id)-->
<!--    .then((response) => {-->
<!--      currentPermissions.value = response.data.permissions;-->
<!--      props.form.context.setFieldValue('permissions', currentPermissions.value);-->
<!--      props.form.context.setFieldValue('currentPermission', response.data.permissions[0]);-->
<!--    })-->
<!--    .catch(() => {-->
<!--      currentPermissions.value = [];-->
<!--    });-->
<!--}-->

<!--function updateUsers() {-->
<!--  console.error('TODO');-->
<!--}-->
<!--</script>-->

<!--<style scoped lang="scss"></style>-->
<template></template>
