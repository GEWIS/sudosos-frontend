<template>
  <div>
    <b-card no-body>
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
      <b-card-body class="mb-0">

        <!-- Table that will display the transactions -->
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header table-header-3"
          id="transaction-table"
          class="mb-0"
          :items="transList"
          :fields="fields"
          :filter="filterValues"
          :per-page="perPage"
          :current-page="currentPage"
          v-on:row-clicked="rowClicked"
          :busy="!loaded"
        >
          <!-- If the table data is still loading display something nice -->
          <template #table-busy>
            <div class="text-center text-muted mt-5 mb-3">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <!-- Columns that are used for daterows -->
          <template v-slot:top-row="{ columns }">
            <td :colspan="columns" class="date-row">
              {{ formatDateTime(transList[0].updatedAt, true) }}
            </td>
          </template>

          <template v-slot:row-details="{ item }">
            <div class="date-row">
              {{ item.nextCategory }}
            </div>
          </template>

          <!-- Templates for each row cell -->
          <template v-slot:cell(updatedAt)="data">
            {{ formatDateTime(data.item.updatedAt) }}
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
        {{ $t('c_transactionsTable.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        @page-click="fetchNewItems"
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
import eventBus from '@/eventbus';
import Formatters from '@/mixins/Formatters';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import { Transaction, TransactionFilter, TransactionList } from '@/entities/Transaction';
import { initFilter } from '@/entities/TransactionFilter';
import { Transfer, TransferFilter, TransferList } from '@/entities/Transfer';
import {
  getPOSTransactions,
  getTransaction,
  getTransactions,
  getUserTransactions,
} from '@/api/transactions';
import { getTransfer, getUserTransfers } from '@/api/transfers';

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

  // If this prop is set all the transactions of a certain POS are being looked at
  @Prop() private pointOfSale: number | undefined;

  // List with all transfers and pagination information
  transfers: TransferList = {} as TransferList;

  // List with all transactions and pagination information
  transactions: TransactionList = {} as TransactionList;

  // Transaction this is displayed in the details modal
  modalTransaction: Transaction | Transfer = {} as Transaction;

  // List of all the transactions and transfers
  transList: (Transaction | Transfer)[] = [];

  // List of all the filtered transactions and transfers (used for csv download)
  filteredTransList: (Transaction | Transfer)[] = [];

  // Amount of items that is being displayed per page
  perPage: number = 10;

  // The current active page
  currentPage: number = 1;

  // The maximum page
  maxPage: number = 1;

  // Contains the total amount of rows that are in the transaction list
  totalRows: number = 0;

  // Current filter values
  filterValues = initFilter();

  // Current transaction filter
  transactionFilter: TransactionFilter = {} as TransactionFilter;

  loaded = false;

  /**
   * Fields that should be shown from the transList
   */
  fields: Object[] = [
    {
      key: 'updatedAt',
      label: this.getTranslation('c_transactionsTable.When'),
      locale_key: 'When',
    },
    {
      key: 'createdAt',
      label: this.getTranslation('c_transactionsTable.What'),
      locale_key: 'What',
    },
    {
      key: 'id',
      label: this.getTranslation('c_transactionsTable.Info'),
      locale_key: 'Info',
    },
  ];

  async beforeMount() {
    this.userState.fetchUser();
    await this.fetchNewData();

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_transactionsTable');
    });
  }

  @Watch('transactions')
  onTransactionsChanged() {
    this.transList = this.concat(this.transList, this.transactions.records);
    this.transactions.records = [];
    this.setTransList();
  }

  @Watch('transfers')
  onTransfersChanged() {
    this.transList = this.concat(this.transList, this.transfers.records);
    this.transfers.records = [];
    this.setTransList();
  }

  @Watch('filterValues.lastUpdate')
  onFilterValuesChanged() {
    this.maxPage = 1;
    this.currentPage = 1;
    this.transList = [];

    if (this.filterValues.fromDate.length > 0) {
      this.transactionFilter.fromDate = this.filterValues.fromDate.toString();
    }

    if (this.filterValues.toDate.length > 0) {
      this.transactionFilter.tillDate = this.filterValues.toDate.toString();
    }
    if (this.filterValues.putInByYou) {
      this.transactionFilter.createdById = this.userState.user.id;
    }

    if (this.filterValues.putInForYou) {
      this.transactionFilter.fromId = this.userState.user.id;
    }

    if (this.filterValues.selfBought) {
      this.transactionFilter.createdById = this.userState.user.id;
      this.transactionFilter.fromId = this.userState.user.id;
    }

    this.fetchNewData();
  }

  setTransList() {
    this.transList.forEach((item, index) => {
      if (this.transList[index + 1] !== undefined) {
        const currentDate = this.formatDateTime(item.updatedAt, true);
        const nextDate = this.formatDateTime(this.transList[index + 1].updatedAt, true);
        if (currentDate !== nextDate) {
          item._showDetails = true;
          item.nextCategory = nextDate;
        }
      }
    });
    this.transList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    this.totalRows = 0;

    if (this.transfers._pagination !== undefined) {
      this.totalRows += this.transfers._pagination.count;
    }

    if (this.transactions._pagination !== undefined) {
      this.totalRows += this.transactions._pagination.count;
    }
  }

  fetchNewItems(event: any, page: number) {
    if (page > this.maxPage) {
      this.fetchNewData(page);
      this.maxPage = page;
    }
  }

  // Grabs the latest items depending on the current page
  async fetchNewData(page = this.currentPage) {
    this.loaded = false;
    const transFilter = this.transactionFilter;
    let skip = (page - 1) * this.perPage;
    let take = this.perPage;

    if (Math.abs(this.maxPage - page) > 1) {
      skip = 0;
      take = Math.max(this.maxPage, page) * this.perPage;
      this.transList = [];
    }

    if (this.pointOfSale !== undefined) {
      this.transactions = await getPOSTransactions(this.pointOfSale, take, skip);
    } else {
      this.transactions = await getUserTransactions(
        this.userState.user.id,
        transFilter,
        take,
        skip,
      );

      this.transfers = await getUserTransfers(
        this.userState.user.id,
        {} as TransferFilter,
        take,
        skip,
      );
    }
    this.loaded = true;
  }

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
    link.download = `${this.$t('c_transactionsTable.Transactions')}.csv`;
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
  async rowClicked(item: Transaction | Transfer, index: Number, event: object) {
    if ('pointOfSale' in item) {
      this.modalTransaction = await getTransaction(item.id);
    } else {
      this.modalTransaction = await getTransfer(item.id);
    }

    this.$nextTick(() => {
      this.$bvModal.show('details-modal');
    });
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
