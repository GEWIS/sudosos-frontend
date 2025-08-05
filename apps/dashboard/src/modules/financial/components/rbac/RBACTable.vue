<template>
  <div v-if="props.state == 'User'">
    <div v-if="props.form.context.values.systemDefault" class="w-30rem">
      <span>
        {{ t('modules.financial.rbac.permissions.systemDefault') }}
      </span>
    </div>
    <div v-else class="w-30rem">{{ t('modules.financial.rbac.permissions.title') }}</div>
  </div>
  <div v-else-if="props.state == 'Permission'" class="flex flex-column justify-content-between gap-3">
    <CardComponent
      :header="props.form.context.values.currentPermission ? props.form.context.values.currentPermission.entity : ''"
    >
      <div class="flex flex-row-reverse flex-wrap gap-3 pb-4">
        <Button
          icon="pi pi-trash"
          :label="t('modules.financial.rbac.permissions.deletePermission')"
          @click="permissionVision = true"
        />
        <Button
          icon="pi pi-plus"
          :label="t('modules.financial.rbac.permissions.addAction')"
          @click="actionVision = true"
        />
      </div>

      <DataTable class="w-full" table-style="min-width: 27.5rem" :value="actionRelations ? actionRelations : []">
        <Column field="action">
          <template #header>
            {{ t('modules.financial.rbac.permissions.action') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.action }}
          </template>
        </Column>
        <Column field="relation">
          <template #header>
            {{ t('modules.financial.rbac.permissions.relation') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.relation }}
          </template>
        </Column>
        <Column field="attribute">
          <template #header>
            {{ t('modules.financial.rbac.permissions.attribute') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.attribute }}
          </template>
        </Column>
        <Column field="delete">
          <template #body="slotProps">
            <Button
              class="p-button-rounded p-button-text p-button-plain"
              icon="pi pi-trash"
              type="button"
              @click="
                handleDeletePush(
                  props.form.context.values.currentPermission.entity,
                  props.form.context.values.id,
                  slotProps.data.action,
                  slotProps.data.relation,
                  slotProps.data.attribute,
                )
              "
            />
          </template>
        </Column>
      </DataTable>
    </CardComponent>
  </div>
  <Dialog
    v-model:visible="permissionVision"
    :header="t('modules.financial.rbac.permissions.deletePermission')"
    modal
    :style="{ width: '25rem' }"
  >
    <span>{{ 'Are you sure you want to delete ' + form.context.values.currentPermission.entity + '?' }}</span>
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.financial.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleDeletePermissionPush(form.context.values.id, form.context.values.currentPermission)"
      />
      <Button
        :label="t('modules.financial.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="permissionVision = false"
      />
    </div>
  </Dialog>
  <Dialog
    v-model:visible="actionVision"
    :header="t('modules.financial.rbac.permissions.addAction')"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-column justify-content-center align-items-center gap-3">
      <Dropdown
        v-model="selectedAction"
        checkmark
        editable
        :highlight-on-select="false"
        :options="testsActions"
        placeholder="Select an Action"
      />

      <Dropdown
        v-model="selectedRelation"
        checkmark
        editable
        :highlight-on-select="false"
        :options="testsRelations"
        placeholder="Select an Relation"
      />

      <Dropdown
        v-model="selectedAttribute"
        checkmark
        editable
        :highlight-on-select="false"
        :options="testsAttributes"
        placeholder="Select an Attribute"
      />
    </div>

    <div v-if="props.form.context.values.systemDefault" class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        v-if="props.form.context.values.systemDefault"
        :label="t('modules.financial.rbac.permissions.actionSubmission')"
        type="button"
        @click="handleAddActionPush()"
      />
      <Button
        :label="t('modules.financial.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="actionVision = false"
      />
    </div>
  </Dialog>
  <DynamicDialog :header="t('modules.financial.rbac.permissions.deleteRow')" />
</template>

<script setup lang="ts">
import { type PropType, ref, watch } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { ActionResponse, PermissionResponse, RelationResponse } from '@sudosos/sudosos-client';
import DynamicDialog from 'primevue/dynamicdialog';
import Dropdown from 'primevue/dropdown';
import DeleteLine from './DeleteLine.vue';
import CardComponent from '@/components/CardComponent.vue';
import { rbacSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import apiService from '@/services/ApiService';

const { t } = useI18n();

const props = defineProps({
  state: {
    type: Object as PropType<string>,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});

const permissionVision = ref(false);
const actionVision = ref(false);
const actionRelations = ref<any[]>();
const selectedAction = ref();
const selectedRelation = ref();
const selectedAttribute = ref();
const testsActions = ['action1', 'action2', 'action3'];
const testsRelations = ['relation1', 'relation2', 'relation3'];
const testsAttributes = ['attribute1', 'attribute2', 'attribute3'];

watch(
  () => props.form.context.values.currentPermission,
  () => {
    const allRelations: any[] = [];
    props.form.context.values.currentPermission.actions.forEach((action) => {
      action.relations.forEach((relation) => {
        allRelations.push({ action: action.action, relation: relation.relation, attribute: relation.attributes[0] });
      });
    });
    actionRelations.value = allRelations;
  },
);

const handleDeletePush = (entity: string, id: number, action: string, relation: string, attribute: string) => {
  dialog.open(DeleteLine, {
    data: {
      action: action,
      relation: relation,
      attribute: attribute,
      entity: entity,
      id: id,
    },
    props: {
      header: t('modules.financial.rbac.permissions.deleteRow'),
    },
  });
};

const handleAddActionPush = () => {};

const handleDeletePermissionPush = (id: number, permission: PermissionResponse) => {
  permission.actions.forEach((action: ActionResponse) => {
    action.relations.forEach((relation: RelationResponse) => {
      //apiService.rbac.deletePermission(id, permission.entity, action.action, relation.relation);
      console.error(relation.relation);
    });
  });
};
</script>

<style scoped lang="scss"></style>
