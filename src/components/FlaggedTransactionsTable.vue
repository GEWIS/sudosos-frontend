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
        />
      </template>
      <b-card-body>
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header"
          :items="transactionFlagList"
          :fields="fields"
          tbody-tr-class="transaction-flag-row"
          :per-page="perPage" :current-page="currentPage"
          id="transaction-flag-table"
          :filter="filterValues.lastUpdate"
          :filter-function="filterRows"
          v-on:filtered="filterDone"
          v-on:row-clicked="rowClicked"
        >

          <!-- Templates for each row cell -->
          <template v-slot:cell(formattedDate)="data">
            {{ data.item.formattedDate }}
          </template>
          <template v-slot:cell(flaggedById)="data">{{ data.item.flaggedById }}</template>

          <template v-slot:cell(status)="data">
            <font-awesome-icon v-if="data.item.status === 'ACCEPTED'"
                               icon="check"
                               class="icon green"
            />
            <font-awesome-icon v-else-if="data.item.status === 'REJECTED'"
                               icon="times"
                               class="icon red"
            />
            <font-awesome-icon v-else icon="question" class="icon orange" />
          </template>

          <template v-slot:cell(reason)="data">
            <div class="cell-reason" />
            {{ data.item.reason }}
          </template>

          <template v-slot:cell(id)="data">
              <font-awesome-icon v-if="data" icon="info-circle" class="icon-grey" />
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer class="d-flex" v-if="totalRows > perPage">
      <p class="my-auto h-100">
        {{ $t('transactionFlagsComponent.Page') }}:
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
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import TransactionTableFilter from '@/components/TransactionTableFilter.vue';
import { Transaction } from '@/entities/Transaction';
import { FlaggedTransaction, FlagStatus } from '@/entities/FlaggedTransaction';
import { initFilter, TableFilter } from '@/entities/TableFilter';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';

@Component({
  components: {
    TransactionTableFilter,
  },
})
export default class TransactionFlagsTable extends Formatters {
  /**
   Props to set the filters, if any of these are false the filter will not be displayed
   */
  @Prop({ default: true, type: Boolean }) selfBought!: boolean;

  @Prop({ default: true, type: Boolean }) private putInByYou!: boolean;

  @Prop({ default: true, type: Boolean }) private putInForYou!: boolean;

  @Prop({ default: true, type: Boolean }) private hideHandled!: boolean;

  @Prop({ default: true, type: Boolean }) private fromDate!: boolean;

  @Prop({ default: true, type: Boolean }) private toDate!: boolean;

  @Prop({ default: true, type: Boolean }) private reset!: boolean;

  @Prop({ default: true, type: Boolean }) private csv!: boolean;

  private flaggedTransactionsState = getModule(FlaggedTransactionModule);

  userAccount = this.$root.$data.currentUser;

  transactionFlagList: FlaggedTransaction[] = [];

  perPage: number = 12;

  currentPage: number = 1;

  previousPage: number = 1;

  totalRows : number = 0;

  filterValues: TableFilter = {} as TableFilter;

  /**
   * Fields that should be shown from the transactionFlagList
   */
  fields: Object[] = [
    {
      key: 'formattedDate',
      label: this.getTranslation('transactionFlagsComponent.When'),
      locale_key: 'When',
    },
    {
      key: 'flaggedById',
      label: this.getTranslation('transactionFlagsComponent.Who'),
      locale_key: 'Who',
    },
    {
      key: 'status',
      label: this.getTranslation('transactionFlagsComponent.Status'),
      locale_key: 'Status',
    },
    {
      key: 'reason',
      label: this.getTranslation('transactionFlagsComponent.Reason'),
      locale_key: 'Reason',
      tdClass: 'cell-reason',
    },
    {
      key: 'id',
      label: this.getTranslation('transactionFlagsComponent.Info'),
      locale_key: 'Info',
    },
  ];

  beforeMount() {
    this.filterValues = initFilter();
    this.flaggedTransactionsState.fetchFlaggedTransactions();
    this.transactionFlagList = this.flaggedTransactionsState.flaggedTransactions;

    this.totalRows = this.transactionFlagList.length;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'transactionFlagsComponent');
    });
  }

  /**
   * Filters the rows based time constraints and user selected options
   *
   * @param data FlaggedTransaction that needs to be filtered
   * @param prop String that we can filter against
  */
  filterRows(data: FlaggedTransaction, prop: String): boolean {
    let other = true;
    let date: boolean;

    // First check if there is a date constraint
    if (this.filterValues.fromDate === '' && this.filterValues.toDate === '') {
      date = true;
    } else if (data.createdAt) {
      const dateFrom = new Date(`${this.filterValues.fromDate} 00:00:00`);
      const dateTo = new Date(`${this.filterValues.toDate} 23:59:59`);

      date = data.createdAt >= dateFrom || data.createdAt <= dateTo;
    } else {
      date = true;
    }

    // Check if there is a hideHandled constraint
    if (this.filterValues.hideHandled) {
      if (data.status !== FlagStatus.TODO) {
        other = false;
      }
    }

    return date && other;
  }

  /**
   * formatTransactionFlags add rows for each date and formats the dates into a nicer format that we
   * want to use for displaying the dates
   *
   * @param t: List of transactions
   */
  formatTransactionFlags: Function = (
    t: FlaggedTransaction[],
  ): FlaggedTransaction[] => t.map(flag => ({
    ...flag,
    formattedDate: this.formatDateTime(flag.createdAt as Date, true),
  }));

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
    this.currentPage = 1;
  }

  /**
   * If a table row is clicked this method will push the transaction to the details page
   *
   * @param item Transaction that makes up the row
   * @param index Index of the row on the current page
   * @param event Click event from the row
   */
  rowClicked(item: Transaction, index: Number, event: object): void {
    this.$router.push({ name: 'flaggedTransactionDetails', params: { id: item.id.toString() } });
  }
}
</script>

<style lang="scss">
tr.transaction-flag-row:hover {
  background-color: #efefef;
}

.transaction-flag-row {
  cursor: pointer;
}

.cell-reason {
  div,
  a {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
  }
}

</style>

<style lang="scss" scoped>
@import "~bootstrap/scss/bootstrap";
@import "./src/styles/Card.scss";

.icon-grey {
  color: $gewis-grey;
}

.green {
  color: $gewis-green;
}

.red {
  color: $gewis-red;
}

.orange {
  color: $gewis-orange;
}

.icon {
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
