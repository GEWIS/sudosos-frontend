<template>
  <div class="page-container flex flex-column">
  <div class="page-title">{{ t('modules.financial.debtor.title') }}</div>
    <div class="content-wrapper flex flex-column">
      <DebtorsTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import DebtorsTable from "@/modules/financial/components/debtors/DebtorsTable.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped lang="scss">

</style>