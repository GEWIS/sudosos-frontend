<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('modules.financial.forms.fine.getEligibleNotify')"
               :value="form.model.date.value.value"
               :attributes="form.model.date.attr.value"
               @update:value="form.context.setFieldValue('date', $event)"
               :errors="form.context.errors.value.date"
               :disabled="false"
               id="date" type="date" />
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {PropType} from "vue";
import type {Form} from "@/utils/formUtils";
import type {getFineEligibleNotifySchema} from "@/utils/validation-schema";
import * as yup from "yup";
import InputSpan from "@/components/InputSpan.vue";

const { t } = useI18n();

defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof getFineEligibleNotifySchema>>>,
    required: true,
  }
});
</script>
<style scoped lang="scss">

</style>
