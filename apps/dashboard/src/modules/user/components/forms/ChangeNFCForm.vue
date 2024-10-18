<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('modules.user.profile.Change NFC')"
               :value="form.model.nfcCode.value.value"
               :attributes="form.model.nfcCode.attr.value"
               @update:value="form.context.setFieldValue('nfcCode', $event)"
               id="nfcCode" type="text"
    />
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import { editNFCSchema } from "@/utils/validation-schema";
import type { PropType } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof editNFCSchema>>>,
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

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  if (userStore.getCurrentUser.user) {
    apiService.user.updateUserNfc(
        userStore.getCurrentUser.user.id,
        { nfcCode: values.nfcCode })
        .then(() => {
          emit('submit:success', values);
          toast.add({
            severity: "success",
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.nfcUpdated')}`,
            life: 3000,
          });
          props.form.context.resetForm();
        })
        .catch((err) => {
          emit('submit:error', err);
          handleError(err, toast);
        });
  }
}));
</script>

<style scoped lang="scss">

</style>
