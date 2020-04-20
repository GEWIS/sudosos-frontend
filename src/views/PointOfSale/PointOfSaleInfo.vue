<template>
  <b-container fluid="lg">
    <b-row>
      <b-col lg="10" cols="12">
        <h1 class="mb-2 mb-sm-2 mb-lg-2 text-truncate">
          {{ $t('posInfo.POS') }}: {{ requestedPOS.name }}
        </h1>
      </b-col>
      <b-col class="approve-reject-buttons" lg="2" cols="12">
        <b-button variant="danger" @click="$router.go(-1)">
          <font-awesome-icon icon="times"></font-awesome-icon>
          {{ $t('posInfo.Close')}}
        </b-button>
      </b-col>
    </b-row>
    <hr>
    <b-row class="m-0">
      <b-col md="3" sm="12">
        <h3>{{ $t('posInfo.General') }}</h3>
        <b>{{ $t('posInfo.Title') }}</b>
        <p>{{ requestedPOS.name }}</p>
        <h3>{{ $t('posInfo.Management') }}</h3>
        <b>{{ $t('posInfo.Owner') }}</b>
        <p>{{ ownerData.organName }}</p>
        <b>{{ $t('posInfo.Managers') }}</b>
        <ul>
          <li v-for="member in ownerData.members" v-bind:key="member">
            {{ member }}
          </li>
        </ul>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posInfo.Containers') }}</p>
        <Container v-for="storage in requestedPOS.storages" v-bind:key="storage.id"
                   :container="storage" :enabled="false"/>
      </b-col>
    </b-row>

    <div class="mt-4 mt-md-5">
      <b-card>
        <b-card-title class="title-form">

          <TransactionTableFilter
            v-model="filterValues"
            v-on:csv="downloadCSV"
            :selfBought="false"
            :putInByYou="false"
            :putInForYou="false"
          ></TransactionTableFilter>

        </b-card-title>
        <b-card-body>

          <!-- Table that will display the transactions -->
          <b-table stacked="sm" small borderless thead-class="table-header table-header-3"
                   :items="transactionList" :fields="fields" :tbody-tr-class="setRowClass"
                   :per-page="perPage" :current-page="currentPage" id="transaction-table"
                   :filter="filterValues.filterWay" :filter-function="filterRows">
            <!-- Templates for each row cell -->
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
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { Storage } from '@/entities/Storage';
import { Product } from '@/entities/Product';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';
import TransactionDetailsModal from '@/components/TransactionDetailsModal.vue';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import Formatters from '@/mixins/Formatters';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';
import { User } from '@/entities/User';

  @Component({
    components: { Container, TransactionDetailsModal, TransactionTableFilter },
  })

export default class PointOfSaleInfo extends Formatters {
    @Prop() private pointOfSale!: PointOfSale;

    // *************************************************
    //
    //               Begin test data
    //
    // *************************************************
    private beugel: Product = {
      id: '1',
      name: 'Grolsch beugel',
      ownerId: '1',
      price: 110,
      picture: 'https://www.supermarktaanbiedingen.com/public/images/product/2017/39/0-508102fls-grolsch-premium-pilsner-beugel-45cl.jpg',
      traySize: 20,
      category: 'drink',
      isAlcoholic: true,
      negative: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    private tripel: Product = {
      id: '2',
      name: 'Grimbergen tripel (voor de sfeer)',
      ownerId: '1',
      price: 90,
      picture: 'https://deklokdranken.blob.core.windows.net/product-images/105120.jpg',
      traySize: 24,
      category: 'drink',
      isAlcoholic: true,
      negative: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    private alcoholFree: Product = {
      id: '3',
      name: 'Alcoholvrije Athena-meuk',
      ownerId: '2',
      price: 50,
      picture: 'https://www.cocktailicious.nl/wp-content/uploads/2019/10/sex-on-the-beach.jpg',
      traySize: 1,
      category: 'drink',
      isAlcoholic: false,
      negative: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    private cocktail: Product = {
      id: '4',
      name: 'Athena-meuk met alcohol',
      ownerId: '2',
      price: 150,
      picture: 'https://www.mitra.nl/cms/userfiles/cocktails/298-mojito43.png',
      traySize: 1,
      category: 'drink',
      isAlcoholic: true,
      negative: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    private bacFridge: Storage = {
      name: 'BAC-koelkast',
      id: '1',
      ownerId: '1',
      products: [this.beugel, this.tripel],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    private outdoorCocktails: Storage = {
      name: 'Athena-cocktails',
      id: '2',
      ownerId: '2',
      products: [this.alcoholFree, this.cocktail],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    private requestedPOS: PointOfSale = {
      name: 'SudoSOS-tablet',
      id: '1',
      ownerId: '1',
      status: POSStatus.ACCEPTED,
      storages: [this.bacFridge, this.outdoorCocktails],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    private ownerData: Object = {
      organName: 'Fictieve sjaarzencommissie',
      members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'],
    }

    // *************************************************
    //
    //               End test data
    //
    // *************************************************


    modalTrans: Transaction = {} as Transaction;

    transactionList: Transaction[] = [];

    filteredTransactions: Transaction[] = [];

    perPage: number = 12;

    currentPage: number = 1;

    previousPage: number = 1;

    totalRows: number = 0;

    filterValues: any = {
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
        label: this.getTranslation('transactionsComponent.When'),
      },
      {
        key: 'comment',
        label: this.getTranslation('transactionsComponent.What'),
      },
      {
        key: 'id',
        label: this.getTranslation('transactionsComponent.Info'),
      },
    ];

    beforeMount() {
      this.transactionList = this.formatTransactions(fakeTransactions.fetchTransactions(
        {} as User,
      ));
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
      // First check if there is a date constraint
      if (this.filterValues.fromDate === '' || this.filterValues.toDate === '') {
        this.totalRows += 1;
        return true;
      }

      const dateFrom = new Date(`${this.filterValues.fromDate} 00:00:00`);
      const dateTo = new Date(`${this.filterValues.toDate} 23:59:59`);

      const date = data.createdAt >= dateFrom && data.createdAt <= dateTo;


      if (date && !this.filteredTransactions.includes(data)) {
        this.filteredTransactions.push(data);
        this.totalRows += 1;
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

  .approve-reject-buttons {
    margin-top: auto;
    margin-bottom: auto;
    text-align: right;

    button:first-of-type {
      margin-right: 8px;
    }

    button {
      min-width: 100px;
      margin-bottom: 8px;
    }
  }
  .containers-container{
    border: 2px solid $gewis-grey-light;

    .containers-header {
      color: $gewis-red;
      font-size: 1em;
      font-weight: 600;
      text-transform: uppercase;
      margin: 1em;
    }
  }

  @include media-breakpoint-down(xs) {
    .icon {
      margin: 0;
    }
  }
</style>
