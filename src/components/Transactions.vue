<template>
  <div>
    <b-card>
      <b-card-title>
        <b-form-group
          id="from"
          label="VAN"
          label-cols="3"
        >
          <b-form-datepicker id="from-date" v-model="fromDate"></b-form-datepicker>
        </b-form-group>
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header table-header-3"
                 :items="transactionList" :fields="fields" :tbody-tr-class="setRowClass">
          <template v-slot:cell(formattedDate)="data">
            <!-- Check if this is a date row, if not make it clickable -->
            <div v-if="/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              {{ data.item.formattedDate }}
            </div>
            <a class="cell-link" href="#" v-else>
              {{ data.item.formattedDate }}
            </a>
          </template>
          <template v-slot:cell(comment)="data">
            <!-- Check if this is a date row, if not make it clickable -->
            <div v-if="/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
            {{ data.item.comment }}
            </div>
            <a class="cell-link" href="#" v-else>
              {{ data.item.comment }}
            </a>
          </template>
          <template v-slot:cell(id)="data">
            <!-- Check if this is a date row, if not add clickable info icon -->
            <a class="cell-link" href="#" v-if="!/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              <font-awesome-icon icon="info-circle" class="icon"></font-awesome-icon>
            </a>
          </template>
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

  return transactions.slice(0, 7);
}

@Component
export default class TransactionsComponent extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList : Transaction[] = [];

  fromDate: Date = new Date();

  /*
    Fields that should be shown from the transactionList
   */
  fields: Object[] = [
    {
      key: 'formattedDate',
      label: 'Wanneer',
    },
    {
      key: 'comment',
      label: 'Wat',
    },
    {
      key: 'id',
      label: 'Info',
    },
  ];

  beforeMount() {
    this.transactionList = this.formatTransactions(fetchTransactions(this.user));
  }

  /*
    setRowClass gives a date row a date-row class and a transaction row a transaction-row class

    @param item : The transaction that makes up this row
    @param type : The type of field this is (should be a row)
   */
  setRowClass(item: Transaction, type: string) : String {
    if (type === 'row' && item.formattedDate !== undefined) {
      // Regular expression that will match 00-00-0000 (word) to find transaction rows that are
      // date rows.
      const re = /\d{2}-\d{2}-\d{4}.\(\w*\)/;

      if (re.test(item.formattedDate.toString())) {
        return 'date-row';
      }
      return 'transaction-row';
    }

    // TODO: Fix
    this.user = this.user;

    return '';
  }

  /*
    formatTransactions add rows for each date and formats the dates into a nicer format that we
    want to use for displaying the dates

    @param t: List of transactions
   */
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
                    + `${TransactionsComponent.parseTime(date.getMonth() + 1)}-`
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
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

  .cell-link {
    display: block;
    color: initial;
    width: 100%;
  }

  .cell-link:hover {
    text-decoration: none;
    color: $black;
  }

  .icon {
    color: $gewis-grey;
    margin-left: 1rem;
  }

  th:nth-of-type(2) {
    display: none;
  }

  @include media-breakpoint-down(xs) {
    .icon {
      margin-left: 0;
    }
  }
</style>
