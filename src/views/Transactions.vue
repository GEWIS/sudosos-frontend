<template>
  <b-container fluid="lg">
      <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('transactions.Transactions') }}</h1>
    <TransactionsTable :hideHandled="false" :user="this.userState.self" />
  </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TransactionsTable from '@/components/TransactionsTable.vue';
import Formatters from '@/mixins/Formatters';

  @Component({
    components: {
      TransactionsTable,
    },
  })
export default class Transactions extends Formatters {
  async beforeMount() {
    await this.userState.fetchSelf();
  }
}
</script>

<style lang="scss" scoped>

</style>
