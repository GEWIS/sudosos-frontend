<template>
  <div class="flex-column">
    <div class="flex justify-content-center">{{ 'Action: ' + dialogRef?.data.action }}</div>
    <div class="flex justify-content-center">{{ 'Relation: ' + dialogRef?.data.relation }}</div>
    <div class="flex justify-content-center">{{ 'Attribute: ' + dialogRef?.data.attribute }}</div>
  </div>
  <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
    <Button
      :label="t('modules.financial.rbac.permissions.deletePermissionConfirmation')"
      type="button"
      @click="
        handleDeleteRowPush(
          dialogRef?.data.id,
          dialogRef?.data.entity,
          dialogRef?.data.action,
          dialogRef?.data.relation,
        )
      "
    />
    <Button
      :label="t('modules.financial.rbac.permissions.deletePermissionCancellation')"
      type="button"
      @click="dialogRef?.close"
    />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import type { Ref } from 'vue';
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import apiService from '@/services/ApiService';

const toast = useToast();
const { t } = useI18n();
const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef');

const handleDeleteRowPush = (id: number, entity: string, action: string, relation: string) => {
  apiService.rbac.deletePermission(id, entity, action, relation).then((response) => {
    if (response.data == 'SUCCESS') {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Deleted Row succesfully',
        life: 3000,
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'We were unable to delete this row',
        life: 3000,
      });
    }
  });
  dialogRef?.value.close();
};
</script>

<style scoped lang="scss"></style>
