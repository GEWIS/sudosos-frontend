<template>
  <b-container fluid="lg">
    <TransactionEditor :transaction="transaction"></TransactionEditor>
  </b-container>
</template>

<script lang="ts">
import TransactionEditor from '@/components/TransactionEditor.vue';
import { Vue, Component } from 'vue-property-decorator';
import { Transaction } from '@/entities/Transaction';
import { getModule } from 'vuex-module-decorators';
import TransactionModule from '@/store/modules/transactions';
import UserModule from '@/store/modules/user';

@Component({
  components: {
    TransactionEditor,
  },
})
export default class TransactionEditPage extends Vue {
  transactionState = getModule(TransactionModule);

  userState = getModule(UserModule);

  transaction: Transaction = {} as Transaction;

  beforeMount() {
    this.userState.fetchUser();
    this.transactionState.fetchUsersTransactions(this.userState.user.id);
    const id = Number(this.$route.params.id);
    const index = this.transactionState.userTransactions.findIndex((trans) => trans.id === id);
    this.transaction = this.transactionState.userTransactions[index];
  }
}
</script>

<style scoped>

</style>
