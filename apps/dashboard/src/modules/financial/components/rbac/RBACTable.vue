<template>
  <div v-if="props.state == 'User'">
    <div v-if="props.form.context.values.systemDefault" class="w-30rem">
      <span>
        {{ t('modules.admin.rbac.permissions.systemDefault') }}
      </span>
    </div>
    <div v-else class="w-30rem">
      <div class="flex flex-row-reverse flex-wrap">
        <Button
          class=""
          icon="pi pi-plus"
          :label="t('modules.admin.rbac.users.addUser')"
          @click="addUserVision = true"
        />
      </div>
      <DataTable class="w-full" table-style="min-width: 27.5rem" :value="users ? users : []">
        <Column field="id">
          <template #header>
            {{ t('modules.admin.rbac.permissions.id') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.id }}
          </template>
        </Column>
        <Column field="firstName">
          <template #header>
            {{ t('modules.admin.rbac.permissions.firstName') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.firstName }}
          </template>
        </Column>
        <Column field="lastName">
          <template #header>
            {{ t('modules.admin.rbac.permissions.lastName') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.lastName }}
          </template>
        </Column>
        <Column>
          <template #body="slotProps">
            <Button
              class="p-button-rounded p-button-text p-button-plain hover:backdrop-brightness-75"
              icon="pi pi-trash"
              type="button"
              @click="handleDeleteUserPush(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
  <div v-else-if="props.state == 'Permission'" class="flex flex-column justify-content-between gap-3">
    <CardComponent
      :header="props.form.context.values.currentPermission ? props.form.context.values.currentPermission.entity : ''"
    >
      <div class="flex flex-row-reverse flex-wrap gap-3 pb-4">
        <Button
          icon="pi pi-trash"
          :label="t('modules.admin.rbac.permissions.deletePermission')"
          @click="permissionVision = true"
        />
        <Button icon="pi pi-plus" :label="t('modules.admin.rbac.permissions.addAction')" @click="actionVision = true" />
      </div>

      <DataTable class="w-full" table-style="min-width: 27.5rem" :value="actionRelations ? actionRelations : []">
        <Column field="action">
          <template #header>
            {{ t('modules.admin.rbac.permissions.action') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.action }}
          </template>
        </Column>
        <Column field="relation">
          <template #header>
            {{ t('modules.admin.rbac.permissions.relation') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.relation }}
          </template>
        </Column>
        <Column field="attribute">
          <template #header>
            {{ t('modules.admin.rbac.permissions.attribute') }}
          </template>
          <template #body="slotProps">
            {{ slotProps.data.attribute }}
          </template>
        </Column>
        <Column field="delete">
          <template #body="slotProps">
            <Button
              class="p-button-rounded p-button-text p-button-plain hover:backdrop-brightness-75"
              icon="pi pi-trash"
              type="button"
              @click="
                handleDeletePush(
                  props.form.context.values.currentPermission.entity,
                  props.form.context.values.id,
                  slotProps.data.action,
                  slotProps.data.relation,
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
    :header="t('modules.admin.rbac.permissions.deletePermission')"
    modal
    :style="{ width: '25rem' }"
  >
    <span>{{ 'Are you sure you want to delete ' + form.context.values.currentPermission.entity + '?' }}</span>
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleDeletePermissionPush(form.context.values.id, form.context.values.currentPermission)"
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="permissionVision = false"
      />
    </div>
  </Dialog>
  <Dialog
    v-model:visible="actionVision"
    :header="t('modules.admin.rbac.permissions.addAction')"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="grid grid-cols-1 gap-3">
      <Select
        v-model="selectedAction"
        checkmark
        editable
        :highlight-on-select="false"
        :options="ownActions"
        placeholder="Select an Action"
      />

      <Select
        v-model="selectedRelation"
        checkmark
        editable
        :highlight-on-select="false"
        :options="ownRelations"
        placeholder="Select an Relation"
      />

      <Select
        v-model="selectedAttribute"
        checkmark
        editable
        :highlight-on-select="false"
        :options="ownAttributes"
        placeholder="Select an Attribute"
      />
    </div>

    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.actionSubmission')"
        type="button"
        @click="
          handleAddActionPush(
            props.form.context.values.currentPermission.entity,
            selectedAction,
            selectedRelation,
            selectedAttribute,
          )
        "
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="actionVision = false"
      />
    </div>
  </Dialog>
  <Dialog
    v-model:visible="deleteUserVision"
    :header="t('modules.admin.rbac.users.deleteUser')"
    modal
    :style="{ width: '25rem' }"
  >
    <span>{{
      'Are you sure you want to delete ' +
      props.form.context.values.currentUser.firstName +
      ' from ' +
      props.form.context.values.name +
      ' ?'
    }}</span>
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleDeleteUserConfirmation(props.form.context.values.currentUser.id, props.form.context.values.id)"
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="deleteUserVision = false"
      />
    </div>
  </Dialog>
  <Dialog
    v-model:visible="addUserVision"
    :header="t('modules.admin.rbac.users.addUser')"
    modal
    :style="{ width: '25rem' }"
  >
    <InputUserSpan
      id="name"
      column
      :errors="t('modules.admin.rbac.users.addUser')"
      label=""
      placeholder="John Doe"
      :show-positive="true"
      :value="props.form.context.values.currentUser"
      @update:value="form.context.setFieldValue('currentUser', $event)"
    />
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleAddUserPush()"
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="addUserVision = false"
      />
    </div>
  </Dialog>
  <Dialog
    v-model:visible="addUserConfirmationVision"
    :header="t('modules.admin.rbac.users.addUser')"
    modal
    :style="{ width: '25rem' }"
  >
    <span>{{
      'Are you sure you want to add ' +
      props.form.context.values.currentUser.firstName +
      ' to ' +
      props.form.context.values.name +
      ' ?'
    }}</span>
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleAddUserConfirmationPush(props.form.context.values.currentUser.id, props.form.context.values.id)"
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="addUserConfirmationVision = false"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { type PropType, ref, watch } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type {
  ActionResponse,
  PermissionResponse,
  RelationResponse,
  UserResponse,
  AddRoleRequest,
  CreatePermissionParams,
} from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import CardComponent from '@/components/CardComponent.vue';
import { rbacSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import InputUserSpan from '@/components/InputUserSpan.vue';

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
const deleteUserVision = ref(false);
const addUserVision = ref(false);
const addUserConfirmationVision = ref(false);
const actionRelations = ref<any[]>();
const users = ref<UserResponse[]>();
const selectedAction = ref();
const selectedRelation = ref();
const selectedAttribute = ref();
const ownActions = ref<string[]>();
const ownRelations = ref<string[]>();
const ownAttributes = ref<string[]>();
const toast = useToast();

watch(
  () => props.form.context.values.currentPermission,
  () => {
    const allRelations: any[] = [];
    props.form.context.values.currentPermission.actions.forEach((action) => {
      action.relations.forEach((relation) => {
        relation.attributes.forEach((attribute) => {
          allRelations.push({ action: action.action, relation: relation.relation, attribute: attribute });
        });
      });
    });
    actionRelations.value = allRelations;
  },
);

watch(
  () => props.form.context.values.users,
  () => {
    users.value = props.form.context.values.users;
  },
);

watch(
  () => props.form.context.values.permissions,
  () => {
    const tempActions: Set<string> = new Set();
    const tempRelations: Set<string> = new Set();
    const tempAttributes: Set<string> = new Set();
    if (props.form.context.values.permissions) {
      props.form.context.values.permissions.forEach((permission) => {
        permission.actions.forEach((action) => {
          tempActions.add(action.action);
          action.relations.forEach((relation) => {
            tempRelations.add(relation.relation);
            relation.attributes.forEach((attribute) => {
              tempAttributes.add(attribute);
            });
          });
        });
      });
    }
    ownActions.value = Array.from(tempActions);
    ownRelations.value = Array.from(tempRelations);
    ownAttributes.value = Array.from(tempAttributes);
  },
);

const handleDeletePush = (entity: string, id: number, action: string, relation: string) => {
  apiService.rbac
    .deletePermission(id, entity, action, relation)
    .then(() => {
      const allRelations: any[] = [];
      props.form.context.values.currentPermission.actions.forEach((action) => {
        action.relations.forEach((relation) => {
          relation.attributes.forEach((attribute) => {
            allRelations.push({ action: action.action, relation: relation.relation, attribute: attribute });
          });
        });
      });
      actionRelations.value = allRelations;
    })
    .catch((error) => {
      handleError(error, toast);
    });
};

const handleAddActionPush = (entity: string, action: string, relation: string, attribute: string) => {
  console.error(entity, action, relation, attribute);
  const addPermissionReq: CreatePermissionParams = {
    entity: entity,
    action: action,
    relation: relation,
    attributes: [attribute],
  };
  apiService.rbac.addPermissions(props.form.context.values.id, [addPermissionReq]).catch((error) => {
    handleError(error, toast);
  });
  actionVision.value = false;
  if (actionRelations.value) {
    const allRelations = actionRelations.value;
    allRelations.push({ action: action, relation: relation, attribute: attribute });
    actionRelations.value = allRelations;
  }
};

const handleDeletePermissionPush = (id: number, permission: PermissionResponse) => {
  permission.actions.forEach((action: ActionResponse) => {
    action.relations.forEach((relation: RelationResponse) => {
      //apiService.rbac.deletePermission(id, permission.entity, action.action, relation.relation);
      console.error(action.action);
    });
  });
};

const handleDeleteUserPush = (user: UserResponse) => {
  deleteUserVision.value = true;
  props.form.context.setFieldValue('currentUser', user);
};

const handleDeleteUserConfirmation = (userId: number, roleId: number) => {
  apiService.user
    .deleteUserRole(userId, roleId)
    .then(() => {
      deleteUserVision.value = false;
      apiService.rbac
        .getRoleUsers(props.form.context.values.id)
        .then((res) => {
          users.value = res.data.records;
          props.form.context.setFieldValue('users', users.value);
        })
        .catch((err) => {
          handleError(err, toast);
        });
    })
    .catch((err) => handleError(err, toast));
};

const handleAddUserPush = () => {
  addUserVision.value = false;
  addUserConfirmationVision.value = true;
};

const handleAddUserConfirmationPush = (id: number) => {
  const roleRequest: AddRoleRequest = { roleId: props.form.context.values.id };
  apiService.user
    .addUserRole(id, roleRequest)
    .then(() => {
      addUserConfirmationVision.value = false;
      apiService.rbac
        .getRoleUsers(props.form.context.values.id)
        .then((res) => {
          users.value = res.data.records;
          props.form.context.setFieldValue('users', users.value);
        })
        .catch((err) => {
          handleError(err, toast);
        });
    })
    .catch((err) => {
      handleError(err, toast);
    });
};
</script>

<style scoped lang="scss"></style>
