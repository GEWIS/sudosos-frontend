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
                :right="right"
                no-flip
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
                :right="right"
                no-flip
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
              v-on:click="downloadCSV"
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
                 details-td-class="test"
                 :filter="filterWay" :filter-function="filterRows">
          <template v-slot:cell(formattedDate)="data">
            <!-- Check if this is a date row, if not make it clickable -->
            <div v-if="/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              {{ data.item.formattedDate }}
            </div>
            <a v-b-modal.details-modal
               v-on:click="selectTransaction(data.item)"
               class="cell-link"
               v-else>
              {{ data.item.formattedDate }}
            </a>
          </template>
          <template v-slot:cell(comment)="data">
            <!-- Check if this is a date row, if not make it clickable -->
            <div v-if="/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              {{ data.item.comment }}
            </div>
            <a v-b-modal.details-modal
               v-on:click="selectTransaction(data.item)"
               class="cell-link"
               v-else>
              {{ data.item.comment }}
            </a>
          </template>
          <template v-slot:cell(id)="data">
            <!-- Check if this is a date row, if not add clickable info icon -->
            <a v-b-modal.details-modal
               v-on:click="selectTransaction(data.item)"
               class="cell-link text-sm-right"
               v-if="!/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              <font-awesome-icon icon="info-circle" class="icon"></font-awesome-icon>
            </a>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      Iets met pagination ofzo
    </b-card-footer>

    <b-modal
      id="details-modal"
      title="transaction details"
      hide-header-close
      centered
      size="lg"
      v-if="Object.entries(modalTrans).length !== 0"
    >
      <p>
        {{ `${formatDateTime(modalTrans.createdAt, true)} - ${modalTrans.formattedDate}` }}
      </p>

      <b-row>
        <b-col cols="6" sm="4">
          <p>Totaal</p>
        </b-col>
        <b-col cols="6" sm="8" class="text-right text-sm-left">
          <p>{{ dinero({amount: modalTrans.totalPrice}).toFormat() }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="4">
          <p>Point of sale</p>
        </b-col>
        <b-col cols="6" sm="8" class="text-right text-sm-left">
          <p>{{ modalTrans.pointOfSale }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="4">
          <p>Afgestreept door</p>
        </b-col>
        <b-col cols="6" sm="8" class="text-right text-sm-left">
          <p>{{ modalTrans.authorized }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="4">
          <p>Afgestreept bij</p>
        </b-col>
        <b-col cols="6" sm="8" class="text-right text-sm-left">
          <p>{{ modalTrans.soldToId }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="6" sm="4">
          <p>Activiteit</p>
        </b-col>
        <b-col cols="6" sm="8" class="text-right text-sm-left">
          <p>{{ modalTrans.activityId }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12" sm="4">
          <p>Producten</p>
        </b-col>
        <b-col cols="12" sm="8" class="total-price">
          <b-row v-for="trans in modalTrans.subTransactions"
                 v-bind:key="trans.productId"
                 >
            <b-col cols="5" sm="6">
              <p class="text-truncate">{{ `${trans.amount} x ${trans.productId}` }}</p>
            </b-col>
            <b-col cols="7" sm="6" class="text-right">
              <p>
                {{ `( ${dinero({amount: trans.pricePerProduct}).toFormat()} ) ` +
                `= ${ dinero({amount: trans.pricePerProduct}).multiply(trans.amount).toFormat()}` }}
              </p>
            </b-col>
          </b-row>
          <hr>
          <b-row>
            <b-col cols="12" class="text-right">
              <p><i>Totaal</i> {{ dinero({amount: modalTrans.totalPrice}).toFormat() }}</p>
            </b-col>
          </b-row>
        </b-col>
      </b-row>

      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button
          variant="primary"
          id="confirm-cancel"
          @click="cancel()"
        >Cancel
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="ok()"
        > FLAG TRANSACTION
        </b-button>
      </template>

    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import dinero, { Dinero } from 'dinero.js';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';


  @Component
export default class TransactionsComponent extends Vue {
    @Prop({ type: Object as () => User }) private user!: User;

    userAccount: User = {
      id: '001',
      firstName: 'Ruben',
      lastName: 'Brinkman',
      saldo: 38.00,
    } as User;

    modalTrans: Transaction = {} as Transaction;

    transactionList: Transaction[] = [];

    filteredTransactions: Transaction[] = [];

    fromDate: String = '';

    toDate: String = '';

    filterWay: String | null = null;

    selfBought: Boolean = false;

    putInByYou: Boolean = false;

    putInForYou: Boolean = false;

    right: boolean = false;

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
      this.transactionList = this.formatTransactions(fakeTransactions.fetchTransactions(this.user));
    }

    /*
      Mounted currently makes sure that the date drowdowns are located correctly
    */
    mounted() {
      this.checkRight();

      window.addEventListener('resize', () => {
        this.checkRight();
      });

      this.$root.$on('bv::dropdown::show', (bvEvent: any) => {
        this.checkRight();
      });
    }

    /*
      Sets the dropdown location of date pickers according to screen width to make sure they fit
    */
    checkRight() : void {
      const ms : boolean = window.innerWidth < 700 && window.innerWidth >= 576;
      const sm : boolean = window.innerWidth < 440;
      this.right = ms || sm;
    }

    /*
      Puts the currently selected transaction into the modal
    */
    selectTransaction(data: Transaction) : void {
      this.modalTrans = data;
    }

    /*
      Function to make dinero usable in the template
    */
    dinero: Function = dinero;

    /*
      setRowClass gives a date row a date-row class and a transaction row a transaction-row class

      @param item : The transaction that makes up this row
      @param type : The type of field this is (should be a row)
     */
    setRowClass(item: Transaction, type: string): String {
      if (type === 'row' && item.formattedDate !== undefined) {
        if (TransactionsComponent.checkFormattedDate(item.formattedDate)) {
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
      Method that takes the current data rows and outputs a downloadable csv file
    */
    downloadCSV() : void {
      let csv = '';
      let downloadSet : Transaction[];
      if (this.filteredTransactions.length > 0) {
        downloadSet = this.filteredTransactions;
      } else {
        downloadSet = this.transactionList.filter(t => !TransactionsComponent.checkFormattedDate(t.formattedDate || ''));
      }

      csv += `${Object.keys(downloadSet[0]).join(',')}\r\n`;

      downloadSet.forEach((transaction) => {
        csv += `${Object.values(transaction).join(',')}\r\n`;
      });

      const csvFile = new Blob([csv], { type: 'text/csv' });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(csvFile);
      link.style.display = 'none';
      link.download = 'Transactions.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    /*
      Filters the rows based time constraints and user selected options
    */
    filterRows(data: Transaction, prop: String): boolean {
      let self = false;
      let putInBy = false;
      let putInFor = false;
      let date: boolean;

      const sold = data.soldToId.toString().split(' ').filter(item => item !== '');
      const auth = data.authorized.toString().split(' ').filter(item => item !== '');

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
        let matchFound = false;

        sold.forEach((person, i) => {
          if (person === auth[i]) {
            matchFound = true;
          }
        });

        self = matchFound && date;
      }

      // Check if there is a putInByYou constraint and take date into account
      if (this.putInByYou) {
        let matchFound = false;

        auth.forEach((person, i) => {
          if (person === this.userAccount.firstName && person !== sold[i]) {
            matchFound = true;
          }
        });

        putInBy = matchFound && date;
      }

      // Check if there is a putInForYou constraint and take date into account
      if (this.putInForYou) {
        let matchFound = false;

        auth.forEach((person, i) => {
          if (person !== this.userAccount.firstName && person !== sold[i]) {
            matchFound = true;
          }
        });

        putInFor = matchFound && date;
      }

      // Check if either both selfBought or putInByYou are true or either one of them.
      if (this.selfBought || this.putInByYou || this.putInForYou) {
        if ((self || putInBy || putInFor)
          && !TransactionsComponent.checkFormattedDate(data.formattedDate || '')
          && !this.filteredTransactions.includes(data)) {
          this.filteredTransactions.push(data);
        }

        return self || putInBy || putInFor;
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

      let transactions: Transaction[] = [];
      let dateTransactions: Transaction[] = [];
      let dateRowTransaction: Transaction = {} as Transaction;
      t.forEach((transaction) => {
        const fDate = this.formatDateTime(transaction.createdAt, true);
        const result: String = dates.find(d => d === fDate) || '';
        const time = this.formatDateTime(transaction.createdAt, false);

        if (!result) {
          dates.push(fDate);

          if (dates.length > 1) {
            transactions.push(dateRowTransaction);
            transactions = transactions.concat(dateTransactions);
            dateTransactions = [];
          }

          dateRowTransaction = {
            id: fDate,
            soldToId: '',
            authorized: '',
            totalPrice: 0,
            pointOfSale: 'Bar (GEWIS)',
            activityId: '',
            subTransactions: [],
            comment: '',
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            formattedDate: fDate,
          } as Transaction;
        }

        const trans: Transaction = transaction;
        trans.formattedDate = time;
        dateRowTransaction.soldToId = `${dateRowTransaction.soldToId} ${transaction.soldToId}`;
        dateRowTransaction.authorized = `${dateRowTransaction.authorized} ${transaction.authorized}`;
        dateRowTransaction.activityId = `${dateRowTransaction.activityId} ${transaction.activityId}`;

        dateTransactions.push(trans);
      });

      if (dateRowTransaction.activityId !== '') {
        transactions.push(dateRowTransaction);
        transactions = transactions.concat(dateTransactions);
      }

      return transactions;
    };

    formatDateTime(date: Date, full: Boolean = true) : string {
      // TODO Fix;
      this.user = this.user;

      const weekDays: String[] = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];

      if (full) {
        return `${TransactionsComponent.parseTime(date.getDate())}-`
          + `${TransactionsComponent.parseTime(date.getMonth() + 1)}-`
          + `${date.getFullYear()} (${weekDays[date.getDay()]})`;
      }

      return `${TransactionsComponent.parseTime(date.getHours())}:`
        + `${TransactionsComponent.parseTime(date.getMinutes())}`;
    }

    static checkFormattedDate(date : String) : boolean {
      // Regular expression that will match 00-00-0000 (word) to find transaction rows that are
      // date rows.
      const re = /\d{2}-\d{2}-\d{4}.\(\w*\)/;

      return re.test(date.toString());
    }

    /*
      Parses times such that each value has a padded 0 if < 10
     */
    static parseTime(value: number): string {
      return (value < 10 ? '0' : '') + value;
    }

    @Watch('fromDate')
    onFromDateChanged(value: Date, old: Date): void {
      this.filteredTransactions = [];
      this.filterWay = value.toString();
    }

    @Watch('toDate')
    onToDateChanged(value: Date, old: Date): void {
      this.filteredTransactions = [];
      this.filterWay = value.toString();
    }

    @Watch('selfBought')
    onSelfBoughtChanged(value: Boolean, old: Boolean): void {
      this.filteredTransactions = [];
      this.filterWay = value.toString();
    }

    @Watch('putInByYou')
    onPutInByYouChanged(value: Boolean, old: Boolean): void {
      this.filteredTransactions = [];
      this.filterWay = value.toString();
    }

    @Watch('putInForYou')
    onPutInForYouChanged(value: Boolean, old: Boolean) : void {
      this.filteredTransactions = [];
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
    cursor: pointer;
  }

  .cell-link:hover {
    text-decoration: none;
    color: $black;
    cursor: pointer;
  }

  .icon {
    color: $gewis-grey;
    margin: 0 1rem;
  }

  .modal-body {
    .row p {
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .total-price > div:nth-last-of-type(2) {
      div:last-of-type > p {
        margin-right: -11px;
      }

      div:last-of-type > p::after {
        content: ' +'
      }
    }

    hr {
      margin: .25rem 0;
      border-color: black;
    }
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
      margin: 0;
    }

    .button {
      width: 100%;
    }

    .form-group {
      margin-bottom: 0;
    }
  }
</style>
