<template>
  <div class="page-container-large align-items-center flex flex-column gap-5">
    <div class="w-full">
      <div class="grid grid-cols-[500px_500px] gap-5">
        <div class="w-full grid grid-cols-1 gap-5">
          <SelectRolesCard :form="form" />
          <PermissionPerRoleCard :form="form" />
        </div>
        <div class="w-full">
          <TabView>
            <TabPanel v-for="state in states" :key="state" :header="state" :value="state">
              <RBACTable :form="form" :state="state" />
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import SelectRolesCard from '@/modules/financial/components/rbac/SelectRolesCard.vue';
import PermissionPerRoleCard from '@/modules/financial/components/rbac/PermissionPerRoleCard.vue';
import { schemaToForm } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';
import RBACTable from '@/modules/financial/components/rbac/RBACTable.vue';

const states: string[] = ['User', 'Permission'];

const form = schemaToForm(rbacSchema);
</script>
