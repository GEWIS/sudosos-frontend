<template>
  <CardComponent :header="t('modules.financial.rbac.permissions.title')">
    <DataTable
      :value="input ? input : null">
      <Column field="entity">
        <template #header>
          {{ t('modules.financial.rbac.permissions.entity') }}
        </template>
      </Column>
      <Column field="icon">
        <template #header>
          {{ t('modules.financial.rbac.permissions.crud') }}
        </template>
        <template #body="slotProps">
          <i class="pi pi-check" v-if="slotProps.data.icon == 'all'"/>
          <i class="pi pi-chart-pie" v-else-if="slotProps.data.icon == 'partial'"/>
          <i class="pi pi-times" v-else/>
        </template>
      </Column>
      <Column >
        <template #body="slotProps">
          <Button
            @click="handleEntityPush(slotProps.data)"
            type="button"
            icon="pi pi-angle-double-right"
            class="p-button-rounded p-button-text p-button-plain"
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">

import CardComponent from "@/components/CardComponent.vue";
import { useI18n } from "vue-i18n";
import { rbacSchema } from "@/utils/validation-schema";
import { type Form, getProperty } from "@/utils/formUtils";
import { computed, type PropType } from "vue";
import * as yup from "yup";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type ActionResponse, type PermissionResponse } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true
  }
});

const permissions = computed(() => {
    return getProperty(props.form, "permissions");
});

const input = computed(() => {
  if(permissions.value){
    const permissionsResponse = permissions.value as unknown as PermissionResponse[];
    const icons : { [id: string] : string; } = {};
    permissionsResponse.forEach((permission) => {
      const filteredData = permission.actions.filter(isCrud);
      if(filteredData.length === 4){
        icons[permission.entity] = "all";
      }
      else if(filteredData.length > 0){
        icons[permission.entity] = "partial";
      }
      else{
        icons[permission.entity] = "None";
      }
    });
    return permissionsResponse.map((permission) => {
      return {
        ...permission,
        icon: icons[permission.entity]
      };
    });
  }
  else{
    return [];
  }
});

const { t } = useI18n();

function handleEntityPush(permission : PermissionResponse){
    props.form.context.setFieldValue("currentPermission", permission);
}

function isCrud(action : ActionResponse){
  return (action.action === "create" || action.action === "delete"
  || action.action === "get" || action.action === "update");
}
</script>

<style scoped lang="scss">

</style>