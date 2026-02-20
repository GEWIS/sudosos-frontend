<template>
  <div>
    <PageContainer>
      <div class="flex flex-col gap-5 md:flex-col">
        <Card class="w-full">
          <template #title> {{ t('modules.user.financialOverview.title') }}</template>
          <template #subtitle> {{ t('modules.user.financialOverview.subtitle') }} </template>
          <template #content>
            <Tabs v-model:value="year" class="w-full">
              <TabList>
                <Tab v-for="y in years" :key="y" :value="y.toString()">{{ y }}</Tab>
              </TabList>
            </Tabs>
            <FinancialOverviewTable :sellers="sellers" :year="year" />
          </template>
        </Card>
      </div>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import FinancialOverviewTable from '@/modules/financial/views/overview/FinancialOverviewTable.vue';
import { useI18n } from 'vue-i18n';
import PageContainer from '@/layout/PageContainer.vue';
import { onMounted, ref, type Ref } from 'vue';
import { useFiscalYear } from '@/composables/fiscalYear.ts';
import { useFinancialOverviewStore } from '@/stores/financial-overview.store.ts';

const { t } = useI18n();

const year: Ref<number> = ref(2026);
const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
const years = getFiscalYearList();
const sellers = ref([]);

const financialOverviewStore = useFinancialOverviewStore();
onMounted(async () => {
  const { start, end } = getFiscalYearRange(2026);
  await financialOverviewStore.fetchAllSellerUsers();
  sellers.value = financialOverviewStore.sellers;
  await financialOverviewStore.fetchFinancialMutationsForAllSellers(start, end);
  await financialOverviewStore.fetchSellerPayoutsForAllSellers(start, end);
});
</script>

<style scoped lang="scss"></style>
