<template>
  <div class="page-container">
    <div class="page-title">{{ $t('payout.Payouts overview') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <CardComponent :header="$t('payout.Payouts')" class="w-full">
        <TabView class="w-full">
          <TabPanel v-for="state in states" :key="state" :header="state">
            <PayoutTable :state="state" />
          </TabPanel>
        </TabView>
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PayoutRequestStatusRequestStateEnum } from "@sudosos/sudosos-client";
import CardComponent from "@/components/CardComponent.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import PayoutTable from "@/modules/financial/components/payout/PayoutTable.vue";

const states = [PayoutRequestStatusRequestStateEnum.Created, PayoutRequestStatusRequestStateEnum.Approved,
  PayoutRequestStatusRequestStateEnum.Denied, PayoutRequestStatusRequestStateEnum.Cancelled];

</script>

<style scoped lang="scss">

</style>
