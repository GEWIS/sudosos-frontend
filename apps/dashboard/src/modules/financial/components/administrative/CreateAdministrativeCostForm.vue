<template>
  <div class="flex flex-col gap-4">
    <IconField icon-position="left" class="w-full">
      <InputIcon class="pi pi-user" />
      <InputNumber
        v-model="userId"
        :placeholder="t('modules.financial.administrative.create.userId')"
        class="w-full"
        :class="{ 'p-invalid': error }"
      />
    </IconField>
    <small v-if="error" class="p-error">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputNumber from 'primevue/inputnumber';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const userId = ref<number | null>(null);
const error = ref<string | null>(null);

defineExpose({
  getValue: () => {
    if (!userId.value) {
      error.value = t('modules.financial.administrative.create.userIdRequired');
      return null;
    }
    error.value = null;
    return { forId: userId.value };
  },
  reset: () => {
    userId.value = null;
    error.value = null;
  },
});
</script>

<style scoped lang="scss"></style>
