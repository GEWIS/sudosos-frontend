<template>
  <div class="flex flex-col page-container">
    <div class="page-title">{{ t('modules.financial.invoice.title') }}</div>
    <div class="content-wrapper flex flex-col">
      <InvoiceAccountOverview />
      <div class="-mb-5 flex flex-row justify-end w-full">
        <Button
          class="z-5"
          icon="pi pi-plus"
          :label="t('modules.financial.invoice.create.create')"
          severity="primary"
          type="button"
          @click="navigateToCreateInvoice"
        />
      </div>
      <Tabs class="w-full" :value="years[0].toString()">
        <TabList>
          <Tab v-for="year in years" :key="year" :value="year.toString()">{{ year.toString() }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel v-for="year in years" :key="year" :value="year.toString()">
            <InvoiceTableYear :year="year" />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import InvoiceTableYear from '@/modules/financial/components/invoice/InvoiceTableYear.vue';
import router from '@/router';
import InvoiceAccountOverview from '@/modules/financial/views/invoice/InvoiceAccountOverview.vue';

const { t } = useI18n();

const years = Array.from(
  { length: Number(new Date().getMonth() > 5) + new Date().getFullYear() - 2022 },
  (_, i) => new Date().getFullYear() + Number(new Date().getMonth() > 5) - i,
);

const navigateToCreateInvoice = () => {
  void router.push({ name: 'invoiceCreate' });
};
</script>

<style scoped lang="scss"></style>
