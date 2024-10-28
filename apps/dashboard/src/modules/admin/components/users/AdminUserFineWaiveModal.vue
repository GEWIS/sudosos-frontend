<template>
  <FormDialog :header="t('modules.admin.singleUser.balance.waiveFines')" v-model:modelValue="isVisible"
              :form="form">
    <template #form="slotProps">
      <div>
        <i>
        {{ t('modules.admin.singleUser.balance.someIsFinesDetailed', { fine: displayFine, waived: displayWaived }) }}
        </i>
        <i
            v-tooltip="t('modules.admin.singleUser.balance.waiveExplanation')"
            class="pi pi-info-circle"
        ></i>
      </div>
      <Divider />
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
import { computed } from "vue";
import { formatPrice } from "@/utils/formatterUtils";

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(waiveUserFineSchema);

const props = defineProps<{
  user: UserResponse,
  balance: BalanceResponse
}>();

const displayFine = computed(() => {
  return formatPrice(props.balance.fine
      || { amount: 0, currency: 'EUR', precision: 2 });
});

const displayWaived = computed(() => {
  return formatPrice(props.balance.fineWaived
      || { amount: 0, currency: 'EUR', precision: 2 });
});

</script>

<style scoped lang="scss">

</style>
