<template>
  <b-container fluid="lg">
    <h1>Flagged Transactions</h1>
    <FlaggedTransactionsComponent></FlaggedTransactionsComponent>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import FlaggedTransactionsComponent from '@/components/FlaggedTransactions.vue';

  @Component({
    components: {
      FlaggedTransactionsComponent,
    },
  })

export default class FlaggedTransactions extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
