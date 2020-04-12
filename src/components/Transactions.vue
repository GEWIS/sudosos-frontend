<template>
  <div>
    <b-card>
      <b-card-title class="title-form">

        <TransactionTableFilter
          v-model="filterValues"
          v-on:csv="downloadCSV"
        ></TransactionTableFilter>

      </b-card-title>
      <b-card-body>

        <!-- Table that will display the transactions -->
        <b-table stacked="sm" small borderless thead-class="table-header table-header-3"
                 :items="transactionList" :fields="fields" :tbody-tr-class="setRowClass"
                 :per-page="perPage" :current-page="currentPage" id="transaction-table"
                 :filter="filterValues.filterWay" :filter-function="filterRows">

          <!-- Template for header slots, makes sure localisation can work -->
          <template v-slot:head(formattedDate)="data">
            <span v-if="data">{{ $t(`transactionsComponent.${data.label}`) }}</span>
          </template>

          <template v-slot:head(comment)="data">
            <span v-if="data">{{ $t(`transactionsComponent.${data.label}`) }}</span>
          </template>

          <template v-slot:head(info)="data">
            <span v-if="data">{{ $t(`transactionsComponent.${data.label}`) }}</span>
          </template>

          <!-- Templates for each row cell -->
          <template v-slot:cell(formattedDate)="data">
            <!-- Check if this is a date row, if not make it clickable -->
            <div v-if="/\d{2}-\d{2}-\d{4}.\(\w*\)/.test(data.item.id)">
              {{ data.item.formattedDate }}
            </div>
            <a v-b-modal.details-modal
               v-on:click="this.modalTrans = data.item"
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
    <b-card-footer v-if="totalRows > perPage" class="d-flex">
      <p class="my-auto h-100">
        {{ $t('transactionsComponent.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        limit="1"
        next-class="nextButton"
        prev-class="prevButton"
        page-class="pageButton"
        hide-goto-end-buttons
        last-number
        @change="pageClicked"
        aria-controls="transaction-table"
        class="custom-pagination mb-0"
      ></b-pagination>
    </b-card-footer>

    <TransactionDetailsModal
      v-if="Object.keys(modalTrans).length > 0"
      :transaction="modalTrans"
    >
    </TransactionDetailsModal>

  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';
import Formatters from '@/mixins/Formatters';


  @Component({
    components: {
      TransactionDetailsModal,
      TransactionTableFilter,
    },
  })
export default class TransactionsComponent extends Formatters {
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

    perPage: number = 12;

    currentPage: number = 1;

    previousPage: number = 1;

    totalRows: number = 0;

    filterValues: any = {
      selfBought: false,
      putInByYou: false,
      putInForYou: false,
      filterWay: null,
      fromDate: '',
      toDate: '',
    };

    /*
      Fields that should be shown from the transactionList
     */
    fields: Object[] = [
      {
        key: 'formattedDate',
        label: 'When',
      },
      {
        key: 'comment',
        label: 'What',
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
      Puts the currently selected transaction into the modal
    */
    selectTransaction(data: Transaction) : void {
      this.modalTrans = data;
    }

    /*
      setRowClass gives a date row a date-row class and a transaction row a transaction-row class

      @param item : The transaction that makes up this row
      @param type : The type of field this is (should be a row)
     */
    setRowClass = (item: Transaction, type: string): String => {
      if (type === 'row' && item.formattedDate !== undefined) {
        if (this.checkFormattedDate(item.formattedDate)) {
          return 'date-row';
        }
        return 'transaction-row';
      }

      return '';
    };

    /*
      Method that takes the current data rows and outputs a downloadable csv file
    */
    downloadCSV() : void {
      let csv = '';
      let downloadSet : Transaction[];

      // Check if a filter has been applied, if yes use the filtered set otherwise first take out
      // all the dateRow rows since those are simply there to make things look pretty.
      if (this.filteredTransactions.length > 0) {
        downloadSet = this.filteredTransactions;
      } else {
        downloadSet = this.transactionList.filter(t => !this.checkFormattedDate(t.formattedDate || ''));
      }

      // Put all the keys into the csv
      csv += `${Object.keys(downloadSet[0]).join(',')}\r\n`;

      // Put all the transactions into the csv
      downloadSet.forEach((transaction) => {
        csv += `${Object.values(transaction).join(',')}\r\n`;
      });

      // Create the actual csv file
      const csvFile = new Blob([csv], { type: 'text/csv' });

      // Create a shadow element on the page that lets the user download the CSV, after delete
      // the shadow element.
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(csvFile);
      link.style.display = 'none';
      link.download = `${this.$t('transactionsComponent.Transactions')}.csv`;
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
      if (this.filterValues.fromDate === '' || this.filterValues.toDate === '') {
        date = true;
      } else {
        const dateFrom = new Date(`${this.filterValues.fromDate} 00:00:00`);
        const dateTo = new Date(`${this.filterValues.toDate} 23:59:59`);

        date = data.createdAt >= dateFrom && data.createdAt <= dateTo;
      }

      // Check if there is a selfBought constraint and take date into account
      if (this.filterValues.selfBought) {
        let matchFound = false;

        sold.forEach((person, i) => {
          if (person === auth[i]) {
            matchFound = true;
          }
        });

        self = matchFound && date;
      }

      // Check if there is a putInByYou constraint and take date into account
      if (this.filterValues.putInByYou) {
        let matchFound = false;

        auth.forEach((person, i) => {
          if (person === this.userAccount.firstName && person !== sold[i]) {
            matchFound = true;
          }
        });

        putInBy = matchFound && date;
      }

      // Check if there is a putInForYou constraint and take date into account
      if (this.filterValues.putInForYou) {
        let matchFound = false;

        auth.forEach((person, i) => {
          if (person !== this.userAccount.firstName && person !== sold[i]) {
            matchFound = true;
          }
        });

        putInFor = matchFound && date;
      }

      // Check if either selfBought, putInByYou or putInForYou are true
      if (this.filterValues.selfBought
        || this.filterValues.putInByYou
        || this.filterValues.putInForYou) {
        if ((self || putInBy || putInFor)
          && !this.checkFormattedDate(data.formattedDate || '')
          && !this.filteredTransactions.includes(data)) {
          this.filteredTransactions.push(data);
          this.totalRows += 1;
        } else if (this.checkFormattedDate(data.formattedDate || '')) {
          this.totalRows += 1;
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
        // Create formatted date and time for each transaction
        const fDate = this.formatDateTime(transaction.createdAt, true);
        const time = this.formatDateTime(transaction.createdAt);

        // If formatted date has not been used yet make a date row
        if (!dates.find(d => d === fDate) || '') {
          dates.push(fDate);

          // If this is the second date row we found push the first one and add the transactions
          // that occured on that date
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
            pointOfSale: '',
            activityId: '',
            subTransactions: [],
            comment: '',
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            formattedDate: fDate,
          } as Transaction;
        }

        // Add all the needed information to the dateRow transaction from the transactions beneath
        // it. This makes sure the filter function can correctly keep the dateRows in the
        // transaction table
        const trans: Transaction = transaction;
        trans.formattedDate = time;
        dateRowTransaction.soldToId = `${dateRowTransaction.soldToId} ${transaction.soldToId}`;
        dateRowTransaction.authorized = `${dateRowTransaction.authorized} ${transaction.authorized}`;
        dateRowTransaction.activityId = `${dateRowTransaction.activityId} ${transaction.activityId}`;

        dateTransactions.push(trans);
      });

      // Push the last dateRow transaction and transactions that accompany it
      if (dateRowTransaction.activityId !== '') {
        transactions.push(dateRowTransaction);
        transactions = transactions.concat(dateTransactions);
      }

      return transactions;
    };

    /*
      Method that grabs extra transactions when 2 pages or less are left
    */
    pageClicked(page: number) : void {
      if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.previousPage = page;
    }

    // /*
    //   Returns the total number of transactions that are currently present
    //  */
    // get totalRows() {
    //   if (this.filteredTransactions.length > 0) {
    //     return this.filteredTransactions.length;
    //   }
    //   return this.transactionList.length;
    // }

    // Reports if string is 00-00-0000 (word) format
    checkFormattedDate = (date : String) : boolean => /\d{2}-\d{2}-\d{4}.\(\w*\)/.test(date.toString());

    /*
      Does everything that needs to be done when the filter changes
    */
    filterChange(data: string) : void {
      this.filteredTransactions = [];
      this.filterValues.filterWay = data;
      this.currentPage = 1;
    }

    @Watch('filterValues', { deep: true })
    onFilterValuesChange(value: any, old: any) {
      this.filterChange(value.filterWay);

      // To make sure that when the filter resets the pagination shows correctly
      if (value.filterWay === null) {
        this.totalRows = this.transactionList.length;
      } else {
        this.totalRows = 0;
      }
    }

    // Watcher to update the amount or rows present when new transactions are added
    @Watch('transactionList')
    onTransactionListChange(value: Transaction[], old: Transaction[]) {
      this.totalRows = value.length;
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

  @include media-breakpoint-down(xs) {
    .icon {
      margin: 0;
    }
  }
</style>
