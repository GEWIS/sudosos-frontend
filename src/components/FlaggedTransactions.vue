<template>
  <div>
    <b-card>
      <b-card-title class="title-form">
        <TransactionFlagTableFilter
          v-model="filterValues"
        ></TransactionFlagTableFilter>
      </b-card-title>
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
          :filter="filterValues.filterWay"
          :filter-function="filterRows"
        >
          <template v-slot:head(formattedDate)="data">
            <span v-if="data">{{ data.label }}</span>
          </template>
          <template v-slot:head(flaggedById)="data">
            <span v-if="data">{{ data.label }}</span>
          </template>
          <template v-slot:head(status)="data">
            <span v-if="data">{{ data.label }}</span>
          </template>
          <template v-slot:head(reason)="data">
            <span v-if="data">{{ data.label }}</span>
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
          <template v-slot:cell(id)="data">
            <a class="cell-link" :href="`/flagged-transactions/flag/${data.item.id}`">
              <font-awesome-icon icon="info-circle" class="icon-grey" />
            </a>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer class="d-flex">
      <p class="my-auto h-100">
        {{ $t('transactionFlagsComponent.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRowCount"
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
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import TransactionFlagTableFilter from '@/components/TransactionFlagTableFilter.vue';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import { TransactionFlag, FlagStatus } from '@/entities/TransactionFlag';
import fakeTransactionFlags from '@/assets/transactionFlags';
import Formatters from '@/mixins/Formatters';

@Component({
  components: {
    TransactionFlagTableFilter,
  },
})
export default class TransactionFlagsComponent extends Formatters {
  @Prop({ type: Object as () => User }) private user!: User;

  userAccount = this.$root.$data.currentUser;

  transactionFlagList: TransactionFlag[] = [];

  filteredTransactionFlags: TransactionFlag[] = [];

  perPage: number = 9;

  currentPage: number = 1;

  previousPage: number = 1;

  totalRows = new Set<String>();

  filterValues: any = {
    hideHandled: false,
    filterWay: null,
    fromDate: '',
    toDate: '',
  };

  /*
    Fields that should be shown from the transactionFlagList
    */
  fields: Object[] = [
    {
      key: 'formattedDate',
      label: this.getTranslation('transactionFlagsComponent.When'),
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'flaggedById',
      label: this.getTranslation('transactionFlagsComponent.Who'),
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'status',
      label: this.getTranslation('transactionFlagsComponent.Status'),
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'reason',
      label: this.getTranslation('transactionFlagsComponent.Reason'),
      tdClass: 'cell-reason clickable',
      tdAttr: this.tableCellAttr,
    },
    {
      key: 'id',
      label: this.getTranslation('transactionFlagsComponent.Info'),
      tdClass: 'clickable',
      tdAttr: this.tableCellAttr,
    },
  ];

  beforeMount() {
    this.transactionFlagList = this.formatTransactionFlags(
      fakeTransactionFlags.fetchTransactionFlags(this.user),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  tableCellAttr(value: any, key: string, item: TransactionFlag) {
    if (key !== 'id') {
      return {
        onclick: `window.location = '/flagged-transactions/flag/${item.id}'`,
      };
    }
    return {};
  }

  /*
    Filters the rows based time constraints and user selected options
  */
  filterRows(data: TransactionFlag, prop: String): boolean {
    let other = true;
    let date: boolean;

    // First check if there is a date constraint
    if (this.filterValues.fromDate === '' || this.filterValues.toDate === '') {
      date = true;
    } else {
      const dateFrom = new Date(`${this.filterValues.fromDate} 00:00:00`);
      const dateTo = new Date(`${this.filterValues.toDate} 23:59:59`);

      date = data.createdAt >= dateFrom && data.createdAt <= dateTo;
    }

    // Check if there is a hideHandled constraint
    if (this.filterValues.hideHandled) {
      if (data.status !== FlagStatus.TODO) {
        other = false;
      }
    }

    if (date && other) {
      this.totalRows.add(data.id);
    }
    return date && other;
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
    if (this.previousPage < page && page >= (Math.ceil(this.totalRows.size / this.perPage) - 2)) {
      // TODO: Grab new data
    }

    this.previousPage = page;
  }

  static parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }

  // Reports if string is 00-00-0000 (word) format
  checkFormattedDate = (date : String) : boolean => /\d{2}-\d{2}-\d{4}.\(\w*\)/.test(date.toString());

  /*
    Returns the total number of transactions that are currently present
   */
  get totalRowCount() {
    return this.totalRows.size;
  }

  /*
      Does everything that needs to be done when the filter changes
    */
  filterChange(data: string) : void {
    this.filteredTransactionFlags = [];
    this.filterValues.filterWay = data;
    this.currentPage = 1;
  }

  @Watch('filterValues', { deep: true })
  onFilterValuesChange(value: any, old: any) {
    this.filterChange(value.filterWay);

    // To make sure that when the filter resets the pagination shows correctly
    if (value.filterWay === null) {
      this.totalRows = new Set(this.transactionFlagList.map(f => f.id));
    } else {
      this.totalRows = new Set();
    }
  }

  // Watcher to update the amount or rows present when new transactions are added
  @Watch('transactionFlagList')
  onTransactionFlagListChange(value: TransactionFlag[], old: TransactionFlag[]) {
    this.totalRows = new Set(value.map(f => f.id));
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
