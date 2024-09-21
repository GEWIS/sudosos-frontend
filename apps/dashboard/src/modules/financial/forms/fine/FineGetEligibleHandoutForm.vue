<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('modules.financial.forms.fine.getEligibleHandout')"
               :value="form.model.daterange.value.value"
               :attributes="form.model.daterange.attr.value"
               @update:value="form.context.setFieldValue('daterange', $event)"
               :errors="form.context.errors.value.daterange"
               :disabled="false"
               id="daterange" type="daterange" />
  </div>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import type {PropType} from "vue";
import type {Form} from "@/utils/formUtils";
import type {getFineEligibleHandoutSchema} from "@/utils/validation-schema";
import * as yup from "yup";
import InputSpan from "@/components/InputSpan.vue";

const { t } = useI18n();

defineProps({
 form: {
   type: Object as PropType<Form<yup.InferType<typeof getFineEligibleHandoutSchema>>>,
   required: true,
 }
});

</script>

<style scoped lang="scss">

</style>
