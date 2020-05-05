<template>
  <b-container fluid="lg">
      <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('transactions.Transactions') }}</h1>
    <TransactionsComponent></TransactionsComponent>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TransactionsTable from '@/components/TransactionsTable.vue';

  @Component({
    components: {
      TransactionsComponent: TransactionsTable,
    },
  })

export default class Transactions extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
