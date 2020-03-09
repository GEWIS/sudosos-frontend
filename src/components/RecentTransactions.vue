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
    createdAt: new Date('January 1, 1997 01:07:00'),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date('December 12, 1997 01:07:00'),
    updatedAt: new Date(),
  } as Transaction,
  {
    id: '42069',
    soldToId: 'Pieter',
    authorized: 'BAK!',
    totalPrice: 1.25,
    activityId: 'BAKwiekent',
    comment: 'Fustje bij ontbijt',
    createdAt: new Date('July 1, 1997 01:07:00'),
    updatedAt: new Date(),
  } as Transaction,
  ] as Transaction[];

  return transactions.slice(0, 5);
}

@Component
export default class RecentTransactions extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList: Transaction[] = [];

  // getTimeString = (value: Date) => value.

  getTimeString = (value: Date) => `${this.parseTime(value.getDate())}-${this.parseTime(value.getMonth() + 1)}-${value.getFullYear()} - ${this.parseTime(value.getHours())}:${this.parseTime(value.getMinutes())}`;

  fields: Object[] = [
    {
      key: 'createdAt',
      label: 'Wanneer',
      formatter: (value: Date) => this.getTimeString(value),
    },
    { key: 'comment', label: 'Wat' },
  ];

  beforeMount() {
    this.transactionList = fetchTransactions(this.user);
  }

  parseTime = function parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
