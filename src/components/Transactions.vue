<template>
  <div>
    <b-card>
      <b-card-title class="title-form">
        <b-form-row>
          <b-col xl="3" sm="6" cols="12" class="mb-2 mb-xl-0">
            <b-form-group
              id="from"
              label="FROM"
              label-cols="3"
            >
              <b-form-datepicker
                id="from-date"
                v-model="fromDate"
                locale="en-NL"
                :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>
          <b-col xl="3" sm="6" cols="12" class="mb-2 mb-xl-0">
            <b-form-group
              id="to"
              label="TO"
              label-cols-sm="2"
              label-cols="3"
            >
              <b-form-datepicker
                id="to-date"
                v-model="toDate"
                locale="en-NL"
                :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
              ></b-form-datepicker>
            </b-form-group>
          </b-col>

          <b-col xl="6" lg="7" md="6" cols="12" class="my-lg-auto mb-2">
            <b-form-row class="justify-content-between px-2">
              <b-form-group
                id="self-bought"
                label-cols="0"
                class="mt-xl-0 mb-xl-3 my-lg-auto"
              >
                <b-form-checkbox
                  id="self-bought-input"
                  name="self-bought-input"
                  v-model="selfBought"
                  :value="true"
                  :unchecked-value="false"
                >
                  Self Bought
                </b-form-checkbox>
              </b-form-group>
              <b-form-group
                id="put-in-by-you"
                label-cols="0"
                class="mt-xl-0 mb-xl-3 my-lg-auto"
              >
                <b-form-checkbox
                  id="put-in-by-you-input"
                  name="put-in-by-you-input"
                  v-model="putInByYou"
                  :value="true"
                  :unchecked-value="false"
                >
                  Put in for others
                </b-form-checkbox>
              </b-form-group>
              <b-form-group
                id="put-in-for-you"
                label-cols="0"
                class="mt-xl-0 mb-xl-3 my-lg-auto"
              >
                <b-form-checkbox
                  id="put-in-for-you-input"
                  name="put-in-for-you-input"
                  v-model="putInForYou"
                  :value="true"
                  :unchecked-value="false"
                >
                  Put in for you
                </b-form-checkbox>
              </b-form-group>
            </b-form-row>
          </b-col>
          <b-col xl="12" lg="5" md="6" cols="12" class="mb-2 mb-lg-0">
            <b-form-row class="flex-row-reverse">
              <div class="button">
            <b-button
              variant="secondary"
              id="add"
            >
              <font-awesome-icon icon="file-export"></font-awesome-icon>
              Export to CSV
            </b-button>
              </div>
              <div class="mr-0 mr-sm-2 mt-2 mt-sm-0 button">
            <b-button
              variant="primary"
              id="reset"
              v-on:click="resetFilters"
            >
              <font-awesome-icon icon="times-circle"></font-awesome-icon>
              Reset filter
            </b-button>
              </div>
            </b-form-row>
          </b-col>
        </b-form-row>

      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header table-header-3"
                 :items="transactionList" :fields="fields" :tbody-tr-class="setRowClass"
                 :filter="filterWay" :filter-function="filterRows">
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
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';

function fetchTransactions(user: User): Transaction[] {
  // something like return client.fetchTransactions(user.id);

  return [{
    id: '001',
    soldToId: 'Ruben',
    authorized: 'Ruben',
    totalPrice: 50.20,
    activityId: '001',
    subTransactions: [],
    comment: 'You spent a total of €50.20',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Transaction,
      {
        id: '002',
        soldToId: 'Ruben',
        authorized: 'Pieter',
        totalPrice: 1.40,
        activityId: '001',
        subTransactions: [],
        comment: 'You spent a total of €1.40',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '003',
        soldToId: 'Ruben',
        authorized: 'BAC',
        totalPrice: 30.00,
        activityId: '002',
        subTransactions: [],
        comment: 'You put €30.00 on your account',
        createdAt: new Date('February 2, 2020 05:07:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '004',
        soldToId: 'Pieter',
        authorized: 'Ruben',
        totalPrice: 8.40,
        activityId: '003',
        subTransactions: [],
        comment: 'You spent a total of €8.40',
        createdAt: new Date('January 1, 2020 01:07:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '005',
        soldToId: 'Pieter',
        authorized: 'Ruben',
        totalPrice: 8.40,
        activityId: '004',
        subTransactions: [],
        comment: 'You spent a total of €8.40',
        createdAt: new Date('December 12, 2019 00:00:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '006',
        soldToId: 'Ruben',
        authorized: 'BAC',
        totalPrice: 3.80,
        activityId: '005',
        subTransactions: [],
        comment: 'You spent a total of €3.80',
        createdAt: new Date('December 5, 2019 18:00:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '007',
        soldToId: 'Ruben',
        authorized: 'BAC',
        totalPrice: 38.00,
        activityId: '005',
        subTransactions: [],
        comment: 'You put €38.00 on your account',
        createdAt: new Date('December 5, 2019 17:00:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '008',
        soldToId: 'Ruben',
        authorized: 'BAC',
        totalPrice: 7.60,
        activityId: '005',
        subTransactions: [],
        comment: 'You spent a total of €7.60',
        createdAt: new Date('December 5, 2019 16:30:00'),
        updatedAt: new Date(),
      } as Transaction,
      {
        id: '009',
        soldToId: 'Ruben',
        authorized: 'BAC',
        totalPrice: 8.40,
        activityId: '005',
        subTransactions: [],
        comment: 'You spent a total of €8.40',
        createdAt: new Date('December 5, 2019 16:00:00'),
        updatedAt: new Date(),
      } as Transaction,
  ] as Transaction[];
}

  @Component
export default class TransactionsComponent extends Vue {
    @Prop({ type: Object as () => User }) private user!: User;

    userAccount: User = {
      id: '001',
      firstName: 'Ruben',
      lastName: 'Brinkman',
      saldo: 38.00,
    } as User;

    transactionList: Transaction[] = [];

    fromDate: String = '';

    toDate: String = '';

    filterWay: String | null = null;

    selfBought: Boolean = false;

    putInByYou: Boolean = false;

    putInForYou: Boolean = false;

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
    setRowClass(item: Transaction, type: string): String {
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
      Simple method that resets all filters to their base state
    */
    resetFilters() : void {
      this.selfBought = false;
      this.putInByYou = false;
      this.putInForYou = false;
      this.filterWay = null;
      this.fromDate = '';
      this.toDate = '';
    }

    /*
      Filters the rows based time constraints and user selected options
    */
    filterRows(data: Transaction, prop: String): boolean {
      let self = false;
      let putInBy = false;
      let putInFor = false;
      let date: boolean;

      // First check if there is a date constraint
      if (this.fromDate === '' || this.toDate === '') {
        date = true;
      } else {
        const dateFrom = new Date(`${this.fromDate} 00:00:00`);
        const dateTo = new Date(`${this.toDate} 23:59:59`);

        date = data.createdAt >= dateFrom && data.createdAt <= dateTo;
      }

      // Check if there is a selfBought constraint and take date into account
      if (this.selfBought) {
        self = data.authorized === data.soldToId && date;
      }

      // Check if there is a putInByYou constraint and take date into account
      if (this.putInByYou) {
        putInBy = data.authorized === this.userAccount.firstName
          && data.authorized !== data.soldToId && date;
      }

      // Check if there is a putInForYou constraint and take date into account
      if (this.putInForYou) {
        putInFor = data.authorized !== this.userAccount.firstName
          && data.authorized !== data.soldToId && date;
      }

      // Check if either both selfBought or putInByYou are true or either one of them.
      if (this.selfBought || this.putInByYou || this.putInForYou) {
        return self || putInBy || putInFor;
      }
      if (this.selfBought || this.putInByYou) {
        return self || putInBy;
      }
      if (this.selfBought || this.putInForYou) {
        return self || putInFor;
      }
      if (this.putInByYou || this.putInByYou) {
        return putInFor || putInBy;
      }
      if (this.selfBought) {
        return self;
      }
      if (this.putInByYou) {
        return putInBy;
      }
      if (this.putInForYou) {
        return putInFor;
      }

      return date;
    }

    /*
      formatTransactions add rows for each date and formats the dates into a nicer format that we
      want to use for displaying the dates

      @param t: List of transactions
     */
    formatTransactions: Function = (t: Transaction[]) => {
      const dates: String[] = [];
      const weekDays: String[] = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];

      const transactions: Transaction[] = [];
      t.forEach((transaction) => {
        const date = transaction.createdAt;
        const fDate = `${TransactionsComponent.parseTime(date.getDate())}-`
          + `${TransactionsComponent.parseTime(date.getMonth() + 1)}-`
          + `${date.getFullYear()} (${weekDays[date.getDay()]})`;
        const result: String = dates.find(d => d === fDate) || '';
        const time = `${TransactionsComponent.parseTime(date.getHours())}:`
          + `${TransactionsComponent.parseTime(date.getMinutes())}`;

        if (!result) {
          dates.push(fDate);

          const trans: Transaction = {
            id: fDate,
            soldToId: transaction.soldToId,
            authorized: transaction.authorized,
            totalPrice: 0,
            activityId: transaction.activityId,
            subTransactions: [],
            comment: '',
            createdAt: date,
            updatedAt: transaction.updatedAt,
            formattedDate: fDate,
          } as Transaction;

          transactions.push(trans);
        }

        const trans: Transaction = transaction;
        trans.formattedDate = time;

        transactions.push(trans);
      });

      return transactions;
    };

    static parseTime(value: number): string {
      return (value < 10 ? '0' : '') + value;
    }

    @Watch('fromDate')
    onFromDateChanged(value: Date, old: Date): void {
      this.filterWay = value.toString();
    }

    @Watch('toDate')
    onToDateChanged(value: Date, old: Date): void {
      this.filterWay = value.toString();
    }

    @Watch('selfBought')
    onSelfBoughtChanged(value: Boolean, old: Boolean): void {
      this.filterWay = value.toString();
    }

    @Watch('putInByYou')
    onPutInByYouChanged(value: Boolean, old: Boolean): void {
      this.filterWay = value.toString();
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

  .card-title {
    margin-bottom: 1rem;

    > .form-row {
      color: black;
    }
  }

  @include media-breakpoint-down(lg) {
    .form-group {
      margin-bottom: 0.5rem;
    }
  }

  @include media-breakpoint-down(xs) {
    .icon {
      margin-left: 0;
    }

    .button {
      width: 100%;
    }

    .form-group {
      margin-bottom: 0;
    }
  }
</style>
