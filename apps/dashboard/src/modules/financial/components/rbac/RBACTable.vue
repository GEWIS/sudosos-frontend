<template>
  <div v-if="props.state == 'User'">
    <span v-if="props.form.context.values.systemDefault">
      {{ t('modules.financial.rbac.permissions.systemDefault') }}
    </span>
    <div v-else>{{ t('modules.financial.rbac.permissions.title') }}</div>
  </div>
  <div v-else-if="props.state == 'Permission'">
    <CardComponent
      :header="props.form.context.values.currentPermission ? props.form.context.values.currentPermission.entity : ''"
    >
      <DataTable> </DataTable>
    </CardComponent>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { type Form } from '@/utils/formUtils';
import * as yup from 'yup';
import { rbacSchema } from '@/utils/validation-schema';
import CardComponent from '@/components/CardComponent.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  state: {
    type: Object as PropType<string>,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});
</script>

<style scoped lang="scss"></style>
