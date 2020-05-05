<template>
  <b-form-row>
    <b-col v-if="dates"
           :xl="hideHandled ? 3 : 6"
           sm="6"
           cols="12"
           class="mb-2 mb-xl-0">
      <b-form-group
        id="from"
        :label="$t('transactionFlagTableFilter.from')"
        label-cols="3"
      >
        <b-form-datepicker
          id="from-date"
          v-model="filterValues.fromDate"
          locale="en-NL"
          :placeholder="$t('transactionFlagTableFilter.placeholder')"
          :right="right"
          no-flip
          :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
        ></b-form-datepicker>
      </b-form-group>
    </b-col>
    <b-col v-if="dates"
           :xl="hideHandled ? 3 : 6"
           sm="6"
           cols="12"
           class="mb-2 mb-xl-0">
      <b-form-group
        id="to"
        :label="$t('transactionFlagTableFilter.to')"
        label-cols-sm="2"
        label-cols="3"
      >
        <b-form-datepicker
          id="to-date"
          v-model="filterValues.toDate"
          locale="en-NL"
          :placeholder="$t('transactionFlagTableFilter.placeholder')"
          :right="right"
          no-flip
          :date-format-options="{year: 'numeric', month: 'long', day: 'numeric'}"
        ></b-form-datepicker>
      </b-form-group>
    </b-col>

    <b-col :xl="dates ? 6 : 12" :lg="dates ? 7 : 12" :md="dates ? 6 : 12" cols="12"
           class="my-lg-auto mb-2">
      <b-form-row class="justify-content-between px-2">
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
            {{ $t('transactionFlagTableFilter.Hide handled') }}
          </b-form-checkbox>
        </b-form-group>
      </b-form-row>
    </b-col>

    <b-col xl="12" lg="5" md="6" cols="12" class="mb-2 mb-lg-0">
      <b-form-row class="flex-row-reverse button-row">
        <div class="mr-0 mr-sm-2 mt-2 mt-sm-0 button"
             v-if="reset">
          <b-button
            variant="primary"
            id="reset"
            v-on:click="resetFilters"
          >
            <font-awesome-icon icon="times-circle"></font-awesome-icon>
            {{ $t('transactionFlagTableFilter.Reset filter') }}
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

  @Component
export default class FlaggedTransactionsTableFilter extends Vue {
    /*
      Props to set the filters, if any of these are false the filter will not be displayed
    */
    @Prop({ default: true, type: Boolean }) hideHandled!: boolean;

    @Prop({ default: true, type: Boolean }) private dates!: boolean;

    @Prop({ default: true, type: Boolean }) private reset!: boolean;

    right: boolean = true;

    filterValues: any = {
      hideHandled: false,
      filterWay: null,
      fromDate: '',
      toDate: '',
    };

    /*
      Mounted currently makes sure that the date dropdowns are located correctly
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

    /*
      Sets the dropdown location of date pickers according to screen width to make sure they fit
    */
    checkRight() : void {
      const ms : boolean = window.innerWidth < 700 && window.innerWidth >= 576;
      const sm : boolean = window.innerWidth < 440;
      this.right = ms || sm;
    }

    /*
      Simple method that resets all filters to their base state
    */
    resetFilters() : void {
      this.filterValues.hideHandled = false;
      this.filterValues.filterWay = null;
      this.filterValues.fromDate = '';
      this.filterValues.toDate = '';

      // $nextTick is here to make sure that the filterWay is null such that the filter will
      // actually reset properly
      this.$nextTick(() => {
        this.filterValues.filterWay = null;
        this.$emit('input', this.filterValues);
      });
    }

    filterUpdated(filterWay : string) : void {
      const filterResults: any = {};

      // If none of the filters are selected make sure the filterWay is null this makes sure the
      // bootstrap table resets the filter and displays all currently available rows
      if (!this.filterValues.hideHandled
          && this.filterValues.fromDate === ''
          && this.filterValues.toDate === '') {
        filterResults.filterWay = null;
      } else {
        filterResults.filterWay = filterWay;
      }

      // Check which filters are applied are available and return only those values
      if (this.hideHandled) {
        filterResults.hideHandled = this.filterValues.hideHandled;
      }

      if (this.dates) {
        filterResults.toDate = this.filterValues.toDate;
        filterResults.fromDate = this.filterValues.fromDate;
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

    @Watch('filterValues.hideHandled')
    onHideHandledChanged(value: Boolean, old: Boolean): void {
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
