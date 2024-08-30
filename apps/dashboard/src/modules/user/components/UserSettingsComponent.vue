<template>
  <CardComponent
      :header="$t('userSettings.userSettings')"
      :func="undefined"
      :action="undefined"
      class="w-5"
  >

    <div class="flex flex-column">
      <FormSection
          :header="t('userSettings.changePin')"
          @cancel="pinForm.context.resetForm"
          @save="pinForm.submit"
          :enableEdit="true"
          :simpleSave="true"
          @update:modelValue="editPin = $event"
          divider>
        <ChangePinForm :form="pinForm" :edit="editPin"/>
      </FormSection>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.changePassword') }}</p>
        <i
            class="pi pi-external-link text-gray-500 flex align-items-center"
        />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('userSettings.apiKeys') }}</h4>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.changeApiKey') }}</p>
        <i
            class="pi pi-external-link text-gray-500 flex align-items-center"
        />
      </div>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-1">{{ t('userSettings.deleteApiKey') }}</p>
        <i
            class="pi pi-external-link text-gray-500 flex align-items-center"
        />
      </div>
      <Divider />
      <h4 class="mt-0">{{ t('userSettings.preferences') }}</h4>
      <div class="flex flex-row align-items-center w-11">
        <p class="flex-grow-1 my-0">{{ t('userSettings.dataAnalysis') }}</p>
        <InputSwitch />
      </div>
    </div>

  </CardComponent>
  <FormDialog
      v-model="showPinDialog"
      :form="pinForm"
      :header="$t('userSettings.changePin')"
  >
    <template #form="slotProps">
      <ChangePinForm :form="slotProps.form" @submit:success="showPinDialog = false"/>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { type PropType, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { UserResponse } from "@sudosos/sudosos-client";
import { defineProps } from "vue";
import CardComponent from "@/components/CardComponent.vue";
import Divider from "primevue/divider";
import InputSwitch from "primevue/inputswitch";
import ChangePinForm from "@/modules/user/components/forms/ChangePinForm.vue";
import FormDialog from "@/components/FormDialog.vue";
import { editPinSchema } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";
import FormSection from "@/components/FormSection.vue";

defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
});

const { t } = useI18n();
const showPinDialog = ref(false);
const pinForm = schemaToForm(editPinSchema);
const editPin = ref(true);


</script>

<style scoped></style>
