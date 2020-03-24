<template>
  <div>
    <b-card>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
                 :items="transactionList" :fields="fields">
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      Iets met pagination ofzo
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { SubTransaction } from '@/entities/SubTransaction';

function fetchTransactions(user: User) : Transaction[] {
  // something like return client.fetchTransactions(user.id);

  const transactions = [{
    id: 'testID',
    soldToId: 'Pieter',
    authorized: 'Koenk',
    totalPrice: 50.2,
    activityId: 'BorrelId',
    subTransactions: [],
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
      subTransactions: [],
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
      subTransactions: [],
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
      subTransactions: [],
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
      subTransactions: [],
      comment: 'Fustje bij ontbijt',
      createdAt: new Date('July 1, 1997 01:07:00'),
      updatedAt: new Date(),
    } as Transaction,
  ] as Transaction[];

  return transactions.slice(0, 5);
}

@Component
export default class TransactionsComponent extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList : Transaction[] = [];

  fields: Object[] = [
    {
      key: 'formattedDate',
      label: 'Wanneer',
      // formatter: (value: Date) => this.getTimeString(value),
    },
    { key: 'comment', label: 'Wat' },
  ];

  beforeMount() {
    this.transactionList = this.formatTransactions(fetchTransactions(this.user));
    // this.formatTransactions(this.transactionList);

    // this.transactionList = ;
  }

  formatTransactions : Function = (t: Transaction[]) => {
    const dates : String[] = [];
    const weekDays : String[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    const transactions : Transaction[] = [];
    t.forEach((transaction) => {
      const date = transaction.createdAt;
      const fDate = `${TransactionsComponent.parseTime(date.getDate())}-`
                    + `${TransactionsComponent.parseTime(date.getMonth())}-`
                    + `${date.getFullYear()} (${weekDays[date.getDay()]})`;
      const result : String = dates.find(d => d === fDate) || '';
      const time = `${TransactionsComponent.parseTime(date.getHours())}:`
                    + `${TransactionsComponent.parseTime(date.getMinutes())}`;

      if (!result) {
        dates.push(fDate);

        const trans : Transaction = {
          id: fDate,
          soldToId: '',
          authorized: '',
          totalPrice: 0,
          activityId: '',
          subTransactions: [],
          comment: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          formattedDate: fDate,
        } as Transaction;

        transactions.push(trans);
      }

      const trans : Transaction = transaction;
      trans.formattedDate = time;

      transactions.push(trans);
    });

    return transactions;
  };

  static parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }
}
</script>

<style lang="scss" scoped>
@import './src/styles/Card.scss';
</style>
