<template>
  <div id="RecentTransactions">
    <div id="RecentTransactionsContainer">
      <h1 id="RecentTransactionsOverzicht">Overzicht</h1>
      <div id="TransactionBox"> <!-- to be replaced by card component -->
        <b-card title="RECENTE TRANSACTIES">
          <b-card-body>
            <table id="RecentTransactionList">
              <thead>
                <td> Wanneer </td>
                <td> Wat </td>
              </thead>
              <tr v-for="(transaction) in transactionList" v-bind:key="transaction.id">
                <td>{{ transaction.createdAt.getDate() + "-"
                  + (transaction.createdAt.getMonth() + 1)
                  + "-" + transaction.createdAt.getYear()
                  + " - " + transaction.createdAt.getHours()
                  + ":" + transaction.createdAt.getMinutes() }}</td>
                <td>{{ transaction.comment }}</td>
              </tr>
            </table>
          </b-card-body>
        </b-card>
        <b-card-footer>
          ALLE TRANSACTIES
        </b-card-footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { Transaction } from '../entities/Transaction';

function fetchTransactions(user: User) : Transaction[] {
  // something like return client.fetchTransactions(user.id);


  const transactions = [{
    id: 'testID',
    soldToId: 'Pieter',
    authorized: 'Koenk',
    totalPrice: 50.2,
    activityId: 'BorrelId',
    comment: 'Borrel metertjes heftig bakweekend, je kent het wel',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
  ] as Transaction[];

  return transactions.slice(0, 5);
}

@Component
export default class RecentTransactions extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList: Transaction[] = [];

  beforeMount() {
    this.transactionList = fetchTransactions(this.user);
  }
}

</script>

<style scoped lang="scss">
  @import '@/styles/RecentTransactionsComponent.scss';
</style>
