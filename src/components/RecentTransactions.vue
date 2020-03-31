<template>
  <div>
    <b-card>
      <b-card-title>
        recente transacties
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
        :items="transactionList" :fields="fields">
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link id="TransactionLink" to="/transactions">alle transacties</router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';

@Component
export default class RecentTransactions extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList: Transaction[] = [];

  // getTimeString = (value: Date) => value.

  getTimeString = (value: Date) => `${RecentTransactions.parseTime(value.getDate())}-`
                                    + `${RecentTransactions.parseTime(value.getMonth() + 1)}-`
                                    + `${value.getFullYear()} - `
                                    + `${RecentTransactions.parseTime(value.getHours())}:`
                                    + `${RecentTransactions.parseTime(value.getMinutes())}`;

  fields: Object[] = [
    {
      key: 'createdAt',
      label: 'Wanneer',
      formatter: (value: Date) => this.getTimeString(value),
    },
    {
      key: 'comment',
      label: 'Wat',
    },
  ];

  beforeMount() {
    this.transactionList = fakeTransactions.fetchTransactions(this.user);
  }

  static parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
