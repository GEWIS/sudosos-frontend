<template>
  <b-form-row>
    <b-col v-if="fromDate"
           :xl="(selfBought || putInForYou || putInByYou) && toDate ? 3 : 6"
           sm="6"
           cols="12"
           class="mb-2 mb-xl-0">
      <b-form-group
        id="from"
        :label="$t('transactionTableFilter.from')"
        label-cols="3"
      >
        <b-form-datepicker
          id="from-date"
          v-model="filterValues.fromDate"
          locale="en-NL"
          :placeholder="$t('transactionTableFilter.placeholder')"
          :right="right"
          no-flip
          :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
        ></b-form-datepicker>
      </b-form-group>
    </b-col>
    <b-col v-if="toDate"
           :xl="(selfBought || putInForYou || putInByYou) && fromDate ? 3 : 6"
           sm="6"
           cols="12"
           class="mb-2 mb-xl-0">
      <b-form-group
        id="to"
        :label="$t('transactionTableFilter.to')"
        label-cols-sm="2"
        label-cols="3"
      >
        <b-form-datepicker
          id="to-date"
          v-model="filterValues.toDate"
          locale="en-NL"
          :placeholder="$t('transactionTableFilter.placeholder')"
          :right="right"
          no-flip
          :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
        ></b-form-datepicker>
      </b-form-group>
    </b-col>

    <b-col :xl="(fromDate || toDate) ? 6 : 12"
           :lg="(fromDate && toDate) ? 12 : ((fromDate || toDate) ? 6 : 12)"
           md="12"
           cols="12"
           class="mb-2 checkboxes">
      <b-form-row class="justify-content-between px-2">
        <b-form-group
          id="self-bought"
          label-cols="0"
          class="mt-xl-0 mb-xl-3 my-lg-auto"
          v-if="selfBought"
        >
          <b-form-checkbox
            id="self-bought-input"
            name="self-bought-input"
            v-model="filterValues.selfBought"
            :value="true"
            :unchecked-value="false"
          >
            {{ $t('transactionTableFilter.Self Bought') }}
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="put-in-by-you"
          label-cols="0"
          class="mt-xl-0 mb-xl-3 my-lg-auto"
          v-if="putInByYou"
        >
          <b-form-checkbox
            id="put-in-by-you-input"
            name="put-in-by-you-input"
            v-model="filterValues.putInByYou"
            :value="true"
            :unchecked-value="false"
          >
            {{ $t('transactionTableFilter.Put in for others') }}
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="put-in-for-you"
          label-cols="0"
          class="mt-xl-0 mb-xl-3 my-lg-auto"
          v-if="putInForYou"
        >
          <b-form-checkbox
            id="put-in-for-you-input"
            name="put-in-for-you-input"
            v-model="filterValues.putInForYou"
            :value="true"
            :unchecked-value="false"
          >
            {{ $t('transactionTableFilter.Put in for you') }}
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          id="hide-handled"
          label-cols="0"
          class="mt-xl-0 mb-xl-3 my-lg-auto"
          v-if="hideHandled"
        >
          <b-form-checkbox
            id="hide-handled-input"
            name="hide-handled-input"
            v-model="filterValues.hideHandled"
            :value="true"
            :unchecked-value="false"
          >
            {{ $t('transactionTableFilter.Hide handled') }}
          </b-form-checkbox>
        </b-form-group>
      </b-form-row>
    </b-col>

    <b-col cols="12">
      <b-form-row class="flex-row-reverse button-row">
        <div class="button"
             v-if="csv">
          <b-button
            variant="secondary"
            id="export"
            v-on:click="$emit('csv')"
          >
            <font-awesome-icon icon="file-export"></font-awesome-icon>
            {{ $t('transactionTableFilter.Export to CSV') }}
          </b-button>
        </div>
        <div class="mr-0 mr-sm-2 mt-2 mt-sm-0 button"
             v-if="reset">
          <b-button
            variant="primary"
            id="reset"
            v-on:click="resetFilters"
          >
            <font-awesome-icon icon="times-circle"></font-awesome-icon>
            {{ $t('transactionTableFilter.Reset filter') }}
          </b-button>
        </div>
      </b-form-row>
    </b-col>
  </b-form-row>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { TableFilter, initFilter } from '@/entities/TableFilter';

  @Component
export default class TransactionTableFilter extends Vue {
    /**
     * Props to set the filters, if any of these are false the filter will not be displayed
     */
    @Prop({ default: true, type: Boolean }) selfBought!: boolean;

    @Prop({ default: true, type: Boolean }) private putInByYou!: boolean;

    @Prop({ default: true, type: Boolean }) private putInForYou!: boolean;

    @Prop({ default: true, type: Boolean }) private hideHandled!: boolean;

    @Prop({ default: true, type: Boolean }) private fromDate!: boolean;

    @Prop({ default: true, type: Boolean }) private toDate!: boolean;

    @Prop({ default: true, type: Boolean }) private reset!: boolean;

    @Prop({ default: true, type: Boolean }) private csv!: boolean;

    right: boolean = true;

    filterValues: TableFilter = {} as TableFilter;

    beforeMount(): void {
      this.filterValues = initFilter();
    }

    /**
     * Mounted currently makes sure that the date dropdowns are located correctly
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

    /**
     * Sets the dropdown location of date pickers according to screen width to make sure they fit
     */
    checkRight() : void {
      const ms : boolean = window.innerWidth < 700 && window.innerWidth >= 576;
      const sm : boolean = window.innerWidth < 440;
      this.right = ms || sm;
    }

    /**
     * Simple method that resets all filters to their base state
     */
    resetFilters() : void {
      this.filterValues = initFilter();

      this.$emit('input', this.filterValues);
    }

    /**
     * Checks which filters are currently active and returns the object needed for filtering
     *
     * @param filterWay updated filterString, used for the b-table filter
     */
    filterUpdated(filterWay : string) : void {
      const filterResults: TableFilter = this.filterValues;

      // If none of the filters are selected make sure the filterWay is null this makes sure the
      // bootstrap table resets the filter and displays all currently available rows
      if (!this.filterValues.selfBought
          && !this.filterValues.putInForYou
          && !this.filterValues.putInByYou
          && !this.filterValues.hideHandled
          && this.filterValues.fromDate === ''
          && this.filterValues.toDate === '') {
        filterResults.filterWay = null;
      } else {
        filterResults.filterWay = filterWay;
      }

      this.$emit('input', filterResults);
    }

    @Watch('filterValues.fromDate')
    onFromDateChanged(value: Date, old: Date): void {
      this.filterUpdated(value.toString());
    }

    @Watch('filterValues.toDate')
    onToDateChanged(value: Date, old: Date): void {
      this.filterUpdated(value.toString());
    }

    @Watch('filterValues.selfBought')
    onSelfBoughtChanged(value: Boolean, old: Boolean): void {
      this.filterUpdated(value.toString());
    }

    @Watch('filterValues.putInByYou')
    onPutInByYouChanged(value: Boolean, old: Boolean): void {
      this.filterUpdated(value.toString());
    }

    @Watch('filterValues.putInForYou')
    onPutInForYouChanged(value: Boolean, old: Boolean) : void {
      this.filterUpdated(value.toString());
    }

    @Watch('filterValues.hideHandled')
    onHideHandledChanged(value: Boolean, old: Boolean) : void {
      this.filterUpdated(value.toString());
    }
}
</script>

<style lang="scss" scoped>
  @import "~bootstrap/scss/bootstrap";

  .card-title {
    margin-bottom: 1rem;

    > .form-row {
      color: black;
    }
  }

  .button-row {
    padding: 0 5px;
  }

  .checkboxes {
    fieldset {
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }
  }

  @include media-breakpoint-down(lg) {
    .form-group {
      margin-bottom: 0.5rem;
    }
  }

  @include media-breakpoint-down(xs) {
    .button {
      width: 100%;
    }

    .form-group {
      margin-bottom: 0;
    }
  }
</style>
