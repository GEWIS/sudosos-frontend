<template>
  <CardComponent :header="t('modules.financial.rbac.users.title')"> </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { useI18n } from 'vue-i18n';
import { rbacSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import { type PropType } from 'vue';
import * as yup from 'yup';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
  },
});

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
