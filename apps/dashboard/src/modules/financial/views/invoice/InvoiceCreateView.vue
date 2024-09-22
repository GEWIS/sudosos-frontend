<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.financial.invoice.create') }}</div>
    <div class="content-wrapper flex flex-column">
      <InvoiceTransactionsCard :form="form"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import InvoiceTransactionsCard from "@/modules/financial/components/invoice/InvoiceTransactionsCard.vue";
import { schemaToForm } from "@/utils/formUtils";
import { createInvoiceObject } from "@/utils/validation-schema";

const { t } = useI18n();

const form = schemaToForm(createInvoiceObject);

</script>

<style scoped lang="scss">

</style>
