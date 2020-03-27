<template>
  <b-container fluid="lg">
      <h1>Transactions page</h1>
    <TransactionsComponent></TransactionsComponent>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TransactionsComponent from '@/components/Transactions.vue';

  @Component({
    components: {
      TransactionsComponent,
    },
  })

export default class Transactions extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
