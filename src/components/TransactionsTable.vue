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
          :filter="filterValues"
          :tbody-tr-class="setRowClass"
          :per-page="perPage"
          :current-page="currentPage"
          v-on:row-clicked="rowClicked"
        >
          <!-- Templates for each row cell -->
          <template v-slot:cell(updatedAt)="data">
            {{ setDate(data.item) }}
          </template>
          <template v-slot:cell(createdAt)="data">
            {{ setDescription(data.item) }}
          </template>
          <template v-slot:cell(id)="data">
            <div class="text-sm-right" v-if="!('formattedDate' in data.item)">
              <font-awesome-icon icon="info-circle" class="icon"/>
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
        aria-controls="transaction-table"
        class="custom-pagination mb-0"
      ></b-pagination>
    </b-card-footer>

    <TransactionDetailsModal
      v-if="Object.keys(modalTransaction).length > 0"
      :trans="modalTransaction"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import eventBus from '@/eventbus';
import Formatters from '@/mixins/Formatters';
import TransactionModule from '@/store/modules/transactions';
import TransferModule from '@/store/modules/transfers';
import UserModule from '@/store/modules/user';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import { Transaction } from '@/entities/Transaction';
import { initFilter, TableFilter } from '@/entities/TableFilter';
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

  @Prop() private pointOfSale: number | undefined;

  private transactionState = getModule(TransactionModule);

  private transferState = getModule(TransferModule);

  private userState = getModule(UserModule);

  // Transaction this is displayed in the details modal
  modalTransaction: Transaction = {} as Transaction;

  // List of all the transactions and transfers
  transList: (Transaction | Transfer)[] = [];

  // List of all the filtered transactions and transfers (used for csv download)
  filteredTransList: (Transaction | Transfer)[] = [];

  // Formatted list with transactions and transfer
  formattedTransList: (Transaction | Transfer | TransactionDateRow)[] = [];

  // Amount of items that is being displayed per page
  perPage: number = 3;

  // The current active page
  currentPage: number = 1;

  // The previous page (currentpage +/- 1)
  previousPage: number = 1;

  // Contains the total amount of rows that are in the transaction list
  totalRows: number = 0;

  // Current filter values
  filterValues: TableFilter = initFilter();

  filterWasUpdated: boolean = true;

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
    this.userState.fetchUser();

    // Check if we need to grab all transaction that are related to a specific point of sale
    // if not just grab all transactions for this user
    if (this.pointOfSale !== undefined) {
      // First fetch all the transactions for a specific point of sale
      // Then check if this point of sale has any transactions
      this.transactionState.fetchPOSTransactions(this.pointOfSale);
      const psTr = this.transactionState.posTransactions.find(trns => trns.id === this.pointOfSale);
      if (psTr !== undefined) {
        this.transList = psTr.transactions;
      }
    } else {
      this.transList = [...this.transactionState.transactions, ...this.transferState.transfers];
    }

    // Sort the transactions just in case
    this.transList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());


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
    // Check if the filter has not changed, if not we can simply return the next/previous
    if (!this.filterWasUpdated) {
      const start = (ctx.currentPage - 1) * this.perPage;

      this.previousPage = this.currentPage;
      return this.formattedTransList.slice(start, start + this.perPage);

      // TODO: Implement some way of fetching more data :)
    }

    // If the filter has changed we need to re-filter the original
    this.filterWasUpdated = false;
    this.previousPage = 1;
    this.currentPage = 1;

    // Filter the list based on the original transList, then add the dateRows
    this.filteredTransList = this.filterTransList(this.transList);
    this.formattedTransList = this.addDateRows(this.filteredTransList);
    this.totalRows = this.formattedTransList.length;

    // Sort the whole thing just in case
    this.formattedTransList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

    return this.formattedTransList.slice(0, this.perPage);
  }

  /**
   * This function adds so called dateRows to the table. These rows are "super" rows that
   * show the date for all the transactions that have been done on that day. The transactions
   * beneath this row will only show the time on which they occured. To make this a bit more
   * user friendly we also add a date row if the transaction for a day carry over a page.
   * If a DateRow would be added as the last row on a page we insert a filler row before it.
   * This filler row is invisible to the user but makes sure that the formatting is nicely.
   *
   * This took me longer than I'm willing to admit, if it ever breaks GL.
   */
  addDateRows(transList: (Transaction | Transfer)[]) {
    const dates: String[] = [];
    const transDateRowList: (Transaction | Transfer | TransactionDateRow)[] = [];

    // First create dateRows for each transaction
    transList.forEach((trans) => {
      // Create formatted date and time for each transaction
      const fDate = this.formatDateTime(trans.createdAt, true);
      const { length } = transDateRowList;

      // Check if we have just entered a new page
      const newPage = length > 0 && length % this.perPage === 0;

      // If this date does not have a dateRow yet or we just went to a new page create a date row
      if ((!dates.find(d => d === fDate)) || newPage) {
        const dateRow: TransactionDateRow = {} as TransactionDateRow;
        dates.push(fDate);
        dateRow.formattedDate = fDate;
        dateRow.createdAt = new Date(trans.createdAt.getTime() - 1);
        dateRow.updatedAt = new Date(trans.updatedAt.getTime() - 1);
        transDateRowList.push(dateRow);

        // If the daterow we just made happens to be the last row on the current page
        // insert a filler row just before it
        if ((length + 1) % this.perPage === 0 && length > 1) {
          const fillerRow: TransactionDateRow = {} as TransactionDateRow;
          fillerRow.createdAt = new Date(dateRow.createdAt.getTime() - 1);
          fillerRow.updatedAt = new Date(dateRow.updatedAt.getTime() - 1);
          fillerRow.formattedDate = '';
          fillerRow.fillerRow = true;
          transDateRowList.push(fillerRow);
        }
      }

      // Push the transaction or transfer
      transDateRowList.push(trans);
    });

    return transDateRowList;
  }

  /**
   * Filters a list of transactions and transfers based on the TransitionTableFilter
   */
  filterTransList(transList: (Transaction | Transfer)[]) {
    return transList.filter((trans) => {
      const { id } = this.userState.user;

      let date: boolean = true;
      let selfBought: boolean = false;
      let putInByYou: boolean = false;
      let putInForYou: boolean = false;

      // Since no filters are active we just return everything
      if (!(this.filterValues.selfBought
        || this.filterValues.putInForYou
        || this.filterValues.putInByYou
        || this.filterValues.fromDate !== ''
        || this.filterValues.toDate !== '')) {
        return true;
      }

      /**
       * First check if the date filters are enabled, based on that check if date constraints
       * are met.
       */
      if (this.filterValues.fromDate !== '' && this.filterValues.toDate !== '') {
        const dateFromDate = new Date(`${this.filterValues.fromDate} 00:00:00`);
        const dateToDate = new Date(`${this.filterValues.toDate} 23:59:59`);

        date = trans.updatedAt >= dateFromDate && trans.updatedAt <= dateToDate;
      } else if (this.filterValues.fromDate !== '' || this.filterValues.toDate !== '') {
        const dateFromDate = new Date(`${this.filterValues.fromDate} 00:00:00`);
        const dateToDate = new Date(`${this.filterValues.toDate} 23:59:59`);

        date = trans.updatedAt >= dateFromDate || trans.updatedAt <= dateToDate;
      }

      /**
       * Next we check for transactions that have been put into the system by the user
       * for him/herself. A transfer is always shown in this case, if createdBy is empty
       * we assume the transaction was made by the user on their own account.
       */
      if (this.filterValues.selfBought) {
        selfBought = ('amount' in trans
          || Object.keys(trans.createdBy as {}).length === 0
          || (trans.from.id === id
            && trans.createdBy !== undefined
            && trans.createdBy.id === id))
          && date;
      }

      /**
       * Here we filter out transaction that have been put into the system by you. But are
       * not for bought by yourself
       */
      if (this.filterValues.putInByYou) {
        putInByYou = !('amount' in trans)
          && trans.createdBy !== undefined
          && Object.keys(trans.createdBy).length > 0
          && trans.createdBy.id === id
          && trans.from.id !== id
          && date;
      }

      /**
       * Last but certainly not least we check for transactions that are for you but
       * have been put into the system by another account
       */
      if (this.filterValues.putInForYou) {
        putInForYou = !('amount' in trans)
          && trans.createdBy !== undefined
          && Object.keys(trans.createdBy).length > 0
          && trans.from.id === id
          && trans.createdBy.id !== id
          && date;
      }

      /**
       * Now if any of the tickboxes have been set we can check whether this row
       * has been set to true by any of them.
       */
      if (this.filterValues.selfBought
        || this.filterValues.putInByYou
        || this.filterValues.putInForYou) {
        return selfBought || putInByYou || putInForYou;
      }

      return date;
    });
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
    if (!('formattedDate' in rowItem) && !('fillerRow' in rowItem)) {
      // Ladies and gentlemen, we have a transactions, we gottem
      if ('pointOfSale' in rowItem) {
        const { id } = this.userState.user;

        // This is a transaction you put in for someone else
        if (rowItem.createdBy !== undefined
              && Object.keys(rowItem.createdBy).length > 0
              && rowItem.createdBy.id === id
              && rowItem.from.id !== id) {
          return this.$t('transactionsComponent.transactionPutFor', { name: rowItem.from.name, amount: rowItem.price.toFormat() });
        }

        // This is a transaction that was put in for you by someone else
        if (rowItem.createdBy !== undefined
          && Object.keys(rowItem.createdBy).length > 0
          && rowItem.from.id === id
          && rowItem.createdBy.id !== id) {
          return this.$t('transactionsComponent.transactionPutBy', { name: rowItem.createdBy.name, amount: rowItem.price.toFormat() });
        }

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
      if ('fillerRow' in item && item.fillerRow !== undefined) {
        return 'filler-row';
      }
      return 'date-row';
    }

    return '';
  };

  /**
   * Method that takes the current data rows and outputs a downloadable csv file
   */
  downloadCSV(): void {
    /**
     * TODO: Needs to be fixed, objects need destructuring for correct download and
     * transfers need to be splitted. Object.values does not work for nested objects
     * or typescript types.
     */
    let csv = '';

    // Put all the keys into the csv
    csv += `${Object.keys(this.filteredTransList[0]).join(',')}\r\n`;

    // Put all the transactions into the csv
    this.filteredTransList.forEach((trans) => {
      csv += `${Object.values(trans).join(',')}\r\n`;
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
   * Shows the details modal if the transaction row is clicked
   *
   * @param item Transaction that makes up the clicked row
   * @param index Index of the row in the current view
   * @param event Click event of the row
   */
  rowClicked(item: Transaction, index: Number, event: object): void {
    if (!('formattedDate' in item)) {
      this.modalTransaction = item;

      this.$nextTick(() => {
        this.$bvModal.show('details-modal');
      });
    }
  }

  @Watch('filterValues.lastUpdate')
  onFilterValuesChanged(oldValue: any, newValue: any) {
    this.filterWasUpdated = true;
  }
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
