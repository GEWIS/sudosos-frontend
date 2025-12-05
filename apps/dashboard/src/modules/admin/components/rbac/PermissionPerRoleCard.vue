<template>
  <CardComponent class="w-full" :header="t('modules.admin.rbac.permissions.title')">
    <DataTable :row-class="rowClass" :value="input ? input : null" @row-click="onRowClick">
      <Column field="entity" :header="t('modules.admin.rbac.permissions.title')"> </Column>
      <Column field="icon" :header="t('modules.admin.rbac.permissions.crud')">
        <template #body="slotProps">
          <i
            v-if="slotProps.data.icon == 'all'"
            v-tooltip="t('modules.admin.rbac.permissions.all')"
            class="pi pi-check"
          />
          <i
            v-else-if="slotProps.data.icon == 'partial'"
            v-tooltip="t('modules.admin.rbac.permissions.partial')"
            class="pi pi-chart-pie"
          />
          <i v-else v-tooltip="t('modules.admin.rbac.permissions.none')" class="pi pi-times" />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import DataTable, { type DataTableRowClickEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { type ActionResponse, type PermissionResponse } from '@sudosos/sudosos-client';
import { type Form, getProperty } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';
import CardComponent from '@/components/CardComponent.vue';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});

const permissions = computed(() => {
  return getProperty(props.form, 'permissions');
});

const input = computed(() => {
  if (permissions.value) {
    const permissionsResponse: PermissionResponse[] = permissions.value;
    const icons: { [id: string]: string } = {};
    permissionsResponse.forEach((permission) => {
      const filteredData = permission.actions.filter(isCrud);
      if (filteredData.length === 4) {
        icons[permission.entity] = 'all';
      } else if (filteredData.length > 0) {
        icons[permission.entity] = 'partial';
      } else {
        icons[permission.entity] = 'none';
      }
    });
    return permissionsResponse.map((permission) => {
      return {
        ...permission,
        icon: icons[permission.entity],
      };
    });
  } else {
    return [];
  }
});

const { t } = useI18n();

const onRowClick = (data: DataTableRowClickEvent<PermissionResponse>) => {
  const permission: PermissionResponse = {
    entity: data.data.entity,
    actions: data.data.actions,
  };
  props.form.context.setFieldValue('currentPermission', permission);
};

const rowClass = () => {
  return ['cursor-pointer', 'hover:bg-black/20'];
};

function isCrud(action: ActionResponse) {
  return (
    action.action === 'create' || action.action === 'delete' || action.action === 'get' || action.action === 'update'
  );
}
</script>

<style scoped lang="scss"></style>
