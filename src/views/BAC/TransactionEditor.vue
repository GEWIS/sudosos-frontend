<template>
  <b-container fluid="lg">
    <EditTransaction :transaction="transaction"></EditTransaction>
  </b-container>
</template>

<script lang="ts">
import EditTransaction from '@/components/EditTransaction.vue';
import { Vue, Component } from 'vue-property-decorator';
import { Transaction } from '@/entities/Transaction';
import { getModule } from 'vuex-module-decorators';
import TransactionModule from '@/store/modules/transactions';

@Component({
  components: {
    EditTransaction,
  },
})
export default class TransactionEditor extends Vue {
  transactionState = getModule(TransactionModule);

  transaction: Transaction = {} as Transaction;

  beforeMount() {
    this.transactionState.fetchTransactions();
    const id = Number(this.$route.params.id);
    const index = this.transactionState.transactions.findIndex((trans) => trans.id === id);
    this.transaction = this.transactionState.transactions[index];
  }
}
</script>

<style scoped>

</style>
