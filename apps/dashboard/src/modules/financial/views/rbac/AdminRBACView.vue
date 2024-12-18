<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.financial.rbac.title') }}</div>
    <div class="content-wrapper flex flex-wrap gap-3">
      <div class="flex flex-column gap-3">
        <SelectRolesCard :form="form"/>
        <PermissionPerRoleCard :form="form"/>
      </div>
      <div class="flex flex-column gap-3">
        <TabView class="w-full">
          <TabPanel v-for="state in states" :key="state" :header="state">
            <RBACTable
                :state="state"
                :form="form"
            />
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import SelectRolesCard from "@/modules/financial/components/rbac/SelectRolesCard.vue";
import PermissionPerRoleCard from "@/modules/financial/components/rbac/PermissionPerRoleCard.vue";
import { schemaToForm } from "@/utils/formUtils";
import { rbacSchema } from "@/utils/validation-schema";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import RBACTable from "@/modules/financial/components/rbac/RBACTable.vue";

const states: string[] = ["User", "Permission"];

const { t } = useI18n();

const form = schemaToForm( rbacSchema );

</script>

<style scoped lang="scss">

</style>