<template>
  <div>
    <b-card>
      <b-card-title class="title-form">
        <b-form-row>
          <b-col xl="3" sm="6" cols="12" class="mb-2 mb-xl-0">
            <b-form-group id="from" :label="$t('flaggedComponent.from')" label-cols="3">
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
              :label="$t('flaggedComponent.to')"
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
              <b-form-group id="self-bought" label-cols="0" class="mt-xl-0 mb-xl-3 my-lg-auto">
                <b-form-checkbox
                  id="hide-handled-input"
                  name="hide-handled-input"
                  v-model="hideHandled"
                  :value="true"
                  :unchecked-value="false"
                >{{ $t('flaggedComponent.Hide handled') }}</b-form-checkbox>
              </b-form-group>
              <div class="mr-0 mr-sm-2 mt-2 mt-sm-0 button">
                <b-button variant="primary" id="reset" v-on:click="resetFilters">
                  <font-awesome-icon icon="times-circle" class="mr-2" />
                  {{ $t('flaggedComponent.Reset filter')}}
                </b-button>
              </div>
            </b-form-row>
          </b-col>
        </b-form-row>
      </b-card-title>
      <b-card-body>
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header"
          :items="transactionFlagList"
          :fields="fields"
          :tbody-tr-class="setRowClass"
          :per-page="perPage" :current-page="currentPage"
          :filter="filterWay"
          :filter-function="filterRows"
        >
          <template v-slot:head(formattedDate)="data">
            <span v-if="data">{{ $t(`flaggedComponent.${data.label}`) }}</span>
          </template>
          <template v-slot:head(flaggedById)="data">
            <span v-if="data">{{ $t(`flaggedComponent.${data.label}`) }}</span>
          </template>
          <template v-slot:head(status)="data">
            <span v-if="data">{{ $t(`flaggedComponent.${data.label}`) }}</span>
          </template>
          <template v-slot:head(reason)="data">
            <span v-if="data">{{ $t(`flaggedComponent.${data.label}`) }}</span>
          </template>
          <template v-slot:head(id)>
            <span/>
          </template>

          <template v-slot:cell(formattedDate)="data">
            {{ data.item.formattedDate }}
          </template>
          <template v-slot:cell(flaggedById)="data">{{ data.item.flaggedById }}</template>
          <!--eslint-disable-next-line vue/no-unused-vars-->
          <template v-slot:cell(status)="data">
            <font-awesome-icon v-if="data.item.status === 'ACCEPTED'" icon="check" class="icon" />
            <font-awesome-icon
              v-else-if="data.item.status === 'REJECTED'"
              icon="times"
              class="icon"
            />
            <font-awesome-icon v-else icon="question" class="icon" />
          </template>
          <template v-slot:cell(reason)="data">
            <div class="cell-reason" />
            {{ data.item.reason }}
          </template>
          <template v-slot:cell(id)>
            <a class="cell-link" href="#">
              <font-awesome-icon icon="info-circle" class="icon-grey" />
            </a>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer class="d-flex">
      <p v-if="totalRows > perPage" class="my-auto h-100">
        {{ $t('flaggedComponent.Page') }}:
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
        v-if="totalRows > perPage"
        aria-controls="transaction-table"
        class="custom-pagination mb-0"
      ></b-pagination>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import dinero, { Dinero } from 'dinero.js';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { TransactionFlag, FlagStatus } from '@/entities/TransactionFlag';
import fakeTransactionFlags from '@/assets/transactionFlags';

@Component
export default class TransactionFlagsComponent extends Vue {
  transactionFlagList: TransactionFlag[] = [];

  filteredTransactionFlags: TransactionFlag[] = [];

  fromDate: String = '';

  toDate: String = '';

  filterWay: String | null = null;

  hideHandled: Boolean = false;

  right: boolean = false;

  perPage: number = 4;

  currentPage: number = 1;

  previousPage: number = 1;

  weekDays : string[] = [];

  /*
    Fields that should be shown from the transactionFlagList
    */
  fields: Object[] = [
    {
      key: 'formattedDate',
      label: 'When',
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'flaggedById',
      label: 'Who',
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'status',
      label: 'Status',
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'reason',
      label: 'Reason',
      tdClass: 'cell-reason clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'id',
      label: 'Info',
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
  ];

  beforeMount() {
    this.transactionFlagList = this.formatTransactionFlags(
      fakeTransactionFlags.fetchTransactionFlags({} as User),
    );
  }

  /*
    Function to make dinero usable in the template
  */
  dinero: Function = dinero;

  /*
    setRowClass gives a date row a date-row class and a transaction-flag
    row a transaction-flag-row class

    @param item : The transaction that makes up this row
    @param type : The type of field this is (should be a row)
    */
  // eslint-disable-next-line class-methods-use-this
  setRowClass(item: TransactionFlag, type: string): String {
    return 'transaction-flag-row';
  }

  /*
    Simple method that resets all filters to their base state
  */
  resetFilters(): void {
    this.hideHandled = false;
    this.filterWay = null;
    this.fromDate = '';
    this.toDate = '';
  }

  // eslint-disable-next-line class-methods-use-this
  tableCellAttr(value: any, key: string, item: TransactionFlag) {
    if (key !== 'id') {
      return {
        onclick: `history.pushState({},'','/flagged-transactions/flag/${item.id}')`,
      };
    }
    return {};
  }

  /*
    Filters the rows based time constraints and user selected options
  */
  filterRows(data: TransactionFlag, prop: String): boolean {
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
    if (this.hideHandled) {
      return data.status === FlagStatus.TODO && date;
    }

    return date;
  }

  /*
    formatTransactions add rows for each date and formats the dates into a nicer format that we
    want to use for displaying the dates

    @param t: List of transactions
    */
  formatTransactionFlags: Function = (
    t: TransactionFlag[],
  ): TransactionFlag[] => t.map(flag => ({
    ...flag,
    formattedDate:
        `${TransactionFlagsComponent.parseTime(flag.createdAt.getDate())}-`
        + `${TransactionFlagsComponent.parseTime(
          flag.createdAt.getMonth() + 1,
        )}-`
        + `${flag.createdAt.getFullYear()}`,
  }));

  /*
      Method that grabs extra transactions when 2 pages or less are left
    */
  pageClicked(page: number) : void {
    if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
      // TODO: Grab new data
    }

    this.previousPage = page;
  }

  static parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }

  /*
    Paging not correct yet!
  */
  get totalRows() {
    if (this.filteredTransactionFlags.length > 0) {
      return this.filteredTransactionFlags.length;
    }
    return this.transactionFlagList.length;
  }

  @Watch('fromDate')
  onFromDateChanged(value: Date, old: Date): void {
    this.filterWay = value.toString();
  }

  @Watch('toDate')
  onToDateChanged(value: Date, old: Date): void {
    this.filterWay = value.toString();
  }

  @Watch('hideHandled')
  onSelfBoughtChanged(value: Boolean, old: Boolean): void {
    this.filterWay = value.toString();
  }
}
</script>

<style lang="scss">
tr.transaction-flag-row:hover {
  background-color: #efefef;
}

.clickable {
  cursor: pointer;
}

.cell-reason {
  max-width: 0;
  width: 50%;

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

.cell-link {
  display: block;
  color: initial;
  width: 100%;
}

.cell-link:hover {
  text-decoration: none;
  color: $black;
}

.icon-grey {
  color: $gewis-grey;
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
