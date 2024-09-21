<template>
  <CardComponent :header="t('modules.financial.fine.action.header')">
    <div class="flex flex-column gap-2">
      <div class="flex flex-row justify-content-between gap-2">
        <FineGetEligibleHandoutForm :form="fineHandoutForm"/>
        <Button :label="t('modules.financial.fine.action.handout')" />
      </div>
      <div class="flex flex-row justify-content-between gap-2">
        <FineGetEligibleNotifyForm :form="fineNotifyForm"/>
        <Button :label="t('modules.financial.fine.action.notify')" />
      </div>

    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
import CardComponent from "@/components/CardComponent.vue";
import {schemaToForm} from "@/utils/formUtils";
import {getFineEligibleHandoutSchema, getFineEligibleNotifySchema} from "@/utils/validation-schema";
import FineGetEligibleHandoutForm from "@/modules/financial/forms/fine/FineGetEligibleHandoutForm.vue";
import FineGetEligibleNotifyForm from "@/modules/financial/forms/fine/FineGetEligibleNotifyForm.vue";

const { t } = useI18n();
const fineHandoutForm = schemaToForm(getFineEligibleHandoutSchema);
const fineNotifyForm = schemaToForm(getFineEligibleNotifySchema);
</script>

<style scoped lang="scss">

</style>
