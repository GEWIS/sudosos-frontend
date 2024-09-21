<template>
  <DataTable :value="props.users"
             paginator
             :rows="10"
  >
    <Column field="fullName" :header="t('common.fullName')" />
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { UserResponse } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";
import type {PropType} from "vue";

const props = defineProps({
  users: {
    type: Array<UserResponse>,
    required: true
  },
  submitFunction: {
    type: Function as PropType<(users: UserResponse[]) => void>,
    required: true,
  }
});

const { t } = useI18n();
</script>

<style scoped>

</style>
