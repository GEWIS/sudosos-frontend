<template>
  <FormDialog :header="t('modules.admin.singleUser.balance.waiveFines')" v-model:modelValue="isVisible"
              :form="form">
    <template #form="slotProps">
      <UserFineWaiveForm
          :user="props.user"
          :balance="props.balance"
          :form="slotProps.form"
          v-model:isVisible="isVisible"/>
    </template>

  </FormDialog>
</template>

<script setup lang="ts">
import { waiveUserFineSchema } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import { schemaToForm } from "@/utils/formUtils";
import { useI18n } from "vue-i18n";
import UserFineWaiveForm from "@/modules/admin/components/users/forms/UserFineWaiveForm.vue";
import type { BalanceResponse, UserResponse } from "@sudosos/sudosos-client";

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(waiveUserFineSchema);

const props = defineProps<{
  user: UserResponse,
  balance: BalanceResponse
}>();
</script>

<style scoped lang="scss">

</style>
