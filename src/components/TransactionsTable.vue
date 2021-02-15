// TODO: FIX FILTER AND DOWNLOAD

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
          :hideHandled="hideHandled"
          :reset="reset"
          :csv="csv"
          v-on:csv="downloadCSV"
        />
      </template>
      <b-card-body>

        <!-- Table that will display the transactions -->
        <b-table
          stacked="sm"
                 small
                 borderless
                 thead-class="table-header table-header-3"
                 id="transaction-table"
                 :items="transProvider"
                 :fields="fields"
                 :tbody-tr-class="setRowClass"
                 :per-page="perPage"
                 :current-page="currentPage"
                 :filter="filterValues.filterWay"
                 :filter-function="filterRows"
                 v-on:filtered="filterDone"
                 v-on:row-clicked="rowClicked">

          <!-- Templates for each row cell -->
          <template v-slot:cell(updatedAt)="data">
              {{ setDate(data.item) }}
          </template>
          <template v-slot:cell(createdAt)="data">
              {{ setDescription(data.item) }}
          </template>
          <template v-slot:cell(id)="data">
            <div class="text-sm-right" v-if="!('formattedDate' in data.item)">
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
      v-if="Object.keys(modalTransaction).length > 0"
      :transaction="modalTransaction"
    />

  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import eventBus from '@/eventbus';
import { Transaction } from '@/entities/Transaction';
import { initFilter, TableFilter } from '@/entities/TableFilter';
import TransactionModule from '@/store/modules/transactions';
import TransferModule from '@/store/modules/transfers';
import { Transfer } from '@/entities/Transfer';
import { TransactionDateRow } from '@/entities/TransactionDateRow';


  @Component({
    components: {
      TransactionDetailsModal,
      TransactionTableFilter,
    },
  })
export default class TransactionsTable extends Formatters {
    // Props to set the filters, if any of these are false the
    // corresponding filter will not be displayed
    @Prop({ default: true, type: Boolean }) selfBought!: boolean;

    @Prop({ default: true, type: Boolean }) private putInByYou!: boolean;

    @Prop({ default: true, type: Boolean }) private putInForYou!: boolean;

    @Prop({ default: true, type: Boolean }) private hideHandled!: boolean;

    @Prop({ default: true, type: Boolean }) private fromDate!: boolean;

    @Prop({ default: true, type: Boolean }) private toDate!: boolean;

    @Prop({ default: true, type: Boolean }) private reset!: boolean;

    @Prop({ default: true, type: Boolean }) private csv!: boolean;

    private transactionState = getModule(TransactionModule);

    private transferState = getModule(TransferModule);

    // Transaction this is displayed in the details modal
    modalTransaction: Transaction = {} as Transaction;

    // List of all the transactions and transfers
    transList: (Transaction | Transfer)[] = [];

    // List of all the filtered transactions and transfers (used for csv download)
    filteredTransList: (Transaction | Transfer)[] = [];

    // Amount of items that is being displayed per page
    perPage: number = 12;

    // The current active page
    currentPage: number = 1;

    // The previous page (currentpage +/- 1)
    previousPage: number = 1;

    // Contains the total amount of rows that are in the transaction list
    totalRows: number = 0;

    filterValues: TableFilter = initFilter();

    /**
     * Fields that should be shown from the transList
     */
    fields: Object[] = [
      {
        key: 'updatedAt',
        label: this.getTranslation('transactionsComponent.When'),
        locale_key: 'When',
      },
      {
        key: 'createdAt',
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
      this.transactionState.fetchTransactions();
      this.transferState.fetchTransfers();
      this.transList = [...this.transactionState.transactions, ...this.transferState.transfers];

      this.totalRows = this.transList.length;

      // If the locale is changed make sure the labels are also correctly updated for the b-table
      eventBus.$on('localeUpdated', () => {
        this.fields = this.updateTranslations(this.fields, 'transactionsComponent');
      });
    }

    /**
     * A items provider function for the b-table. This inserts the needed dateRows
     * into the items such that formatting is clear
     */
    transProvider(ctx: any) {
      console.log(JSON.stringify(ctx));
      const dates: String[] = [];
      const transProviderList: (Transaction | Transfer | TransactionDateRow)[] = [];

      this.transList.forEach((trans) => {
        // Create formatted date and time for each transaction
        const fDate = this.formatDateTime(trans.createdAt, true);

        // If formatted date has not been used yet make a date row
        if (!dates.find(d => d === fDate) || '') {
          const dateRow: TransactionDateRow = {} as TransactionDateRow;
          dates.push(fDate);
          dateRow.formattedDate = fDate;
          dateRow.createdAt = new Date(trans.createdAt.getTime() - 1);
          dateRow.updatedAt = new Date(trans.updatedAt.getTime() - 1);
          transProviderList.push(dateRow);
        }

        // Push the transaction or transfer
        transProviderList.push(trans);
      });

      // Sort the whole thing just in case
      transProviderList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

      return transProviderList;
    }

    /**
     * If this is a dateRow the formatted date will be displayed otherwise just
     * the time
     */
    setDate(rowItem: Transaction | Transfer | TransactionDateRow) {
      if ('formattedDate' in rowItem) {
        return this.formatDateTime(rowItem.updatedAt, true);
      }

      return this.formatDateTime(rowItem.updatedAt);
    }

    /**
     * Depending on the type of rowItem we have a description is needed. This sets
     * the description according to the the type of the row
     */
    setDescription(rowItem: Transaction | Transfer | TransactionDateRow) {
      if (!('formattedDate' in rowItem)) {
        // We have a transactions
        if ('pointOfSale' in rowItem) {
          return this.$t('transactionsComponent.transaction', { amount: rowItem.price.toFormat() });
        }

        if (rowItem.description !== undefined) {
          return rowItem.description;
        }

        return this.$t('transactionsComponent.transfer', { amount: rowItem.amount.toFormat() });
      }
      return '';
    }

    /**
     * setRowClass gives a date row a date-row class and a transaction/transfer
     * row a transaction-row class
     *
     * If the item has an id (i.e. is a transaction or transfer) it is given
     * said class.
     *
     * @param item The transaction that makes up this row
     * @param type The type of field this is (should be a row)
     */
    setRowClass = (item: Transaction | Transfer | TransactionDateRow, type: string): String => {
      if (type === 'row') {
        if ('id' in item) {
          return 'transaction-row';
        }
        return 'date-row';
      }

      return '';
    };

    /**
     * Method that takes the current data rows and outputs a downloadable csv file
     */
    downloadCSV() : void {
      let csv = '';
      let downloadSet: (Transaction | Transfer)[] = [];

      // Check if a filter has been applied, if yes use the filtered set otherwise first take out
      // all the dateRow rows since those are simply there to make things look pretty.
      if (this.filteredTransList.length > 0) {
        downloadSet = this.filteredTransList;
      } else {
        // TODO: FIX
        // eslint-disable-next-line max-len
        // downloadSet = this.transList.filter(t => !this.checkFormattedDate(t.formattedDate || ''));
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
      // let self = false;
      // let putInBy = false;
      // let putInFor = false;
      let date: boolean;
      console.log('hoi');

      // const sold = data.soldToId.toString().split(' ').filter(item => item !== '');
      // const auth = data.authorized.toString().split(' ').filter(item => item !== '');

      // First check if there is a date constraint
      if (this.filterValues.fromDate === '' && this.filterValues.toDate === '') {
        date = true;
      } else if (data.createdAt) {
        const dateFromDate = new Date(`${this.filterValues.fromDate} 00:00:00`);
        const dateToDate = new Date(`${this.filterValues.toDate} 23:59:59`);

        date = data.createdAt >= dateFromDate || data.createdAt <= dateToDate;
      } else {
        date = true;
      }

      // Check if there is a selfBought constraint and take date into account
      // if (this.filterValues.selfBought) {
      //   let matchFound = false;
      //
      //   sold.forEach((person, i) => {
      //     if (person === auth[i]) {
      //       matchFound = true;
      //     }
      //   });
      //
      //   self = matchFound && date;
      // }

      // Check if there is a putInByYou constraint and take date into account
      // if (this.filterValues.putInByYou) {
      //   let matchFound = false;
      //
      //   auth.forEach((person, i) => {
      //     if (person === this.userAccount.name && person !== sold[i]) {
      //       matchFound = true;
      //     }
      //   });
      //
      //   putInBy = matchFound && date;
      // }

      // Check if there is a putInForYou constraint and take date into account
      // if (this.filterValues.putInForYou) {
      //   let matchFound = false;
      //
      //   auth.forEach((person, i) => {
      //     if (person !== this.userAccount.firstName && person !== sold[i]) {
      //       matchFound = true;
      //     }
      //   });
      //
      //   putInFor = matchFound && date;
      // }

      // Check if either selfBought, putInByYou or putInForYou are true
      // if (this.filterValues.selfBought
      //   || this.filterValues.putInByYou
      //   || this.filterValues.putInForYou) {
      //   return self || putInBy || putInFor;
      // }

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
      // TODO: FIX
      // eslint-disable-next-line max-len
      // this.filteredTransList = result.filter(t => !this.checkFormattedDate(t.formattedDate || ''));
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
      // TODO: FIX
      if (!this.checkFormattedDate('')) {
        this.modalTransaction = item;

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
