<template>
  <div>
    <b-card>
      <template v-slot:header>
        <TransactionTableFilter
          v-model="filterValues"
          class="title-form"
          :fromDate="fromDate"
          :toDate="toDate"
          :selfBought="selfBought"
          :putInByYou="putInByYou"
          :putInForYou="putInForYou"
          :reset="reset"
          :csv="csv"
          v-on:csv="downloadCSV"
        ></TransactionTableFilter>
      </template>
      <b-card-body>

        <!-- Table that will display the transactions -->
        <b-table stacked="sm"
                 small
                 borderless
                 thead-class="table-header table-header-3"
                 id="transaction-table"
                 :items="transactionList"
                 :fields="fields"
                 :tbody-tr-class="setRowClass"
                 :per-page="perPage"
                 :current-page="currentPage"
                 :filter="filterValues.filterWay"
                 :filter-function="filterRows"
                 v-on:filtered="filterDone"
                 v-on:row-clicked="rowClicked">

          <!-- Templates for each row cell -->
          <template v-slot:cell(formattedDate)="data">
              {{ data.item.formattedDate }}
          </template>
          <template v-slot:cell(comment)="data">
              {{ data.item.comment }}
          </template>
          <template v-slot:cell(id)="data">
            <div class="text-sm-right" v-if="!checkFormattedDate(data.item.id)">
              <font-awesome-icon icon="info-circle" class="icon"></font-awesome-icon>
            </div>
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
    />

  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import { TableFilter } from '@/entities/TableFilter';


  @Component({
    components: {
      TransactionDetailsModal,
      TransactionTableFilter,
    },
  })
export default class TransactionsTable extends Formatters {
    /**
     Props to set the filters, if any of these are false the filter will not be displayed
     */
    @Prop({ default: true, type: Boolean }) selfBought!: boolean;

    @Prop({ default: true, type: Boolean }) private putInByYou!: boolean;

    @Prop({ default: true, type: Boolean }) private putInForYou!: boolean;

    @Prop({ default: true, type: Boolean }) private fromDate!: boolean;

    @Prop({ default: true, type: Boolean }) private toDate!: boolean;

    @Prop({ default: true, type: Boolean }) private reset!: boolean;

    @Prop({ default: true, type: Boolean }) private csv!: boolean;

    userAccount: User = this.$store.state.currentUser;

    modalTrans: Transaction = {} as Transaction;

    transactionList: Transaction[] = [];

    filteredTransactions: Transaction[] = [];

    perPage: number = 12;

    currentPage: number = 1;

    previousPage: number = 1;

    totalRows: number = 0;

    filterValues: TableFilter = {
      selfBought: false,
      putInByYou: false,
      putInForYou: false,
      filterWay: null,
      fromDate: '',
      toDate: '',
    };

    /**
      Fields that should be shown from the transactionList
     */
    fields: Object[] = [
      {
        key: 'formattedDate',
        label: this.getTranslation('transactionsComponent.When'),
        locale_key: 'When',
      },
      {
        key: 'comment',
        label: this.getTranslation('transactionsComponent.What'),
        locale_key: 'What',
      },
      {
        key: 'id',
        label: this.getTranslation('transactionsComponent.Info'),
        locale_key: 'Info',
      },
    ];

    beforeMount() {
      this.transactionList = this.formatTransactions(
        fakeTransactions.fetchTransactions(this.userAccount),
      );

      this.totalRows = this.transactionList.length;

      // If the locale is changed make sure the labels are also correctly updated for the b-table
      eventBus.$on('localeUpdated', () => {
        this.fields = this.updateTranslations(this.fields, 'transactionsComponent');
      });
    }

    /**
     * setRowClass gives a date row a date-row class and a transaction row a transaction-row class
     *
     * @param item The transaction that makes up this row
     * @param type The type of field this is (should be a row)
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

    /**
     * Method that takes the current data rows and outputs a downloadable csv file
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

    /**
     * Filters the rows based time constraints and user selected options, is called by the b-table
     * if the filterValues.filterRow is updated
     *
     * @prop data Transaction that is currently being filtered against the filterValues
     * @prop prop filterProp that has been filled in by the user
     */
    filterRows(data: Transaction, prop: String): boolean {
      let self = false;
      let putInBy = false;
      let putInFor = false;
      let date: boolean;

      const sold = data.soldToId.toString().split(' ').filter(item => item !== '');
      const auth = data.authorized.toString().split(' ').filter(item => item !== '');

      // First check if there is a date constraint
      if (this.filterValues.fromDate === '' && this.filterValues.toDate === '') {
        date = true;
      } else {
        const dateFromDate = new Date(`${this.filterValues.fromDate} 00:00:00`);
        const dateToDate = new Date(`${this.filterValues.toDate} 23:59:59`);

        date = data.createdAt >= dateFromDate || data.createdAt <= dateToDate;
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
        return self || putInBy || putInFor;
      }

      return date;
    }

    /**
     * Method that grabs extra transactions when 2 pages or less are left
    */
    pageClicked(page: number) : void {
      if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.previousPage = page;
    }

    /**
     * Once the filter is done update the totalRows and filtered rows
     */
    filterDone(result: Transaction[]): void {
      this.totalRows = result.length;
      this.filteredTransactions = result.filter(t => !this.checkFormattedDate(t.formattedDate || ''));
      this.currentPage = 1;
    }

    /**
     * Shows the details modal if the transaction row is clicked
     *
     * @param item Transaction that makes up the clicked row
     * @param index Index of the row in the current view
     * @param event Click event of the row
     */
    rowClicked(item: Transaction, index: Number, event: object): void {
      if (!this.checkFormattedDate(item.formattedDate || '')) {
        this.modalTrans = item;

        this.$nextTick(() => {
          this.$bvModal.show('details-modal');
        });
      }
    }

    /**
     * Check if string is of format `00-00-0000 (word)`
     */
    checkFormattedDate = (date : String) : boolean => /\d{2}-\d{2}-\d{4}.\(\w*\)/.test(date.toString());
}
</script>

<style lang="scss" scoped>
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

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
