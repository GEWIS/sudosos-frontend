<template>
  <b-container fluid="lg">
    <deposit-processing-alert />
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('home.Overview') }}</h1>
    <b-row>
      <b-col lg="3" class="mb-3">
        <CurrentSaldo></CurrentSaldo>
      </b-col>
      <b-col cols="12" lg="9">
        <RecentTransactionsTable></RecentTransactionsTable>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RecentTransactionsTable from '@/components/RecentTransactionsTable.vue';
import CurrentSaldo from '@/components/CurrentSaldo.vue';
import DepositProcessingAlert from '@/components/DepositProcessingAlert.vue';

  @Component({
    components: {
      DepositProcessingAlert,
      RecentTransactionsTable,
      CurrentSaldo,
    },
  })
export default class Home extends Vue {
}
</script>

<style scoped lang="scss">

</style>
