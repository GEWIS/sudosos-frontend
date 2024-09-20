<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('common.name')"
               :value="form.model.name.value.value"
               :attributes="form.model.name.attr.value"
               @update:value="form.context.setFieldValue('name', $event)"
               :errors="form.context.errors.value.name"
               :disabled="!edit"
               id="name" :placeholder="t('common.placeholders.banner')" type="text" />
    <InputSpan :label="t('modules.admin.forms.banner.duration')"
               :value="form.model.duration.value.value"
               :attributes="form.model.duration.attr.value"
               @update:value="form.context.setFieldValue('duration', $event)"
               :errors="form.context.errors.value.duration"
               :disabled="!edit"
               id="duration" type="number" />
    <InputSpan :label="t('modules.admin.forms.banner.timespan')"
               :value="form.model.daterange.value.value"
               :attributes="form.model.daterange.attr.value"
               @update:value="form.context.setFieldValue('daterange', $event)"
               :errors="form.context.errors.value.daterange"
               :disabled="!edit"
               id="daterange" type="daterange" />
    <InputSpan :label="t('common.active')"
               :value="form.model.active.value.value"
               :attributes="form.model.active.attr.value"
               @update:value="form.context.setFieldValue('active', $event)"
               :errors="form.context.errors.value.active"
               :disabled="!edit"
               id="active" type="boolean" />
  </div>
</template>

<script setup lang="ts">

import { useI18n } from "vue-i18n";
import type { createBannerSchema } from "@/utils/validation-schema";
import { type Form } from "@/utils/formUtils";
import type { PropType } from "vue";
import InputSpan from "@/components/InputSpan.vue";
import * as yup from "yup";

const { t } = useI18n();

defineEmits(['update:edit']);

defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createBannerSchema>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: true,
  },
});


</script>

<style scoped>

</style>
