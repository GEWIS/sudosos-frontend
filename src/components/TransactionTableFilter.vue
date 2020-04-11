<template>
  <b-form-row>
    <b-col xl="3" sm="6" cols="12" class="mb-2 mb-xl-0">
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
    <b-col xl="3" sm="6" cols="12" class="mb-2 mb-xl-0">
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

    <b-col xl="6" lg="7" md="6" cols="12" class="my-lg-auto mb-2">
      <b-form-row class="justify-content-between px-2">
        <b-form-group
          id="self-bought"
          label-cols="0"
          class="mt-xl-0 mb-xl-3 my-lg-auto"
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
      </b-form-row>
    </b-col>
    <b-col xl="12" lg="5" md="6" cols="12" class="mb-2 mb-lg-0">
      <b-form-row class="flex-row-reverse">
        <div class="button">
          <b-button
            variant="secondary"
            id="add"
            v-on:click="$emit('csv')"
          >
            <font-awesome-icon icon="file-export"></font-awesome-icon>
            {{ $t('transactionTableFilter.Export to CSV') }}
          </b-button>
        </div>
        <div class="mr-0 mr-sm-2 mt-2 mt-sm-0 button">
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
  Component, Vue, Watch,
} from 'vue-property-decorator';

  @Component
export default class TransactionTableFilter extends Vue {
    right: boolean = true;

    filterValues: any = {
      selfBought: false,
      putInByYou: false,
      putInForYou: false,
      filterWay: null,
      fromDate: '',
      toDate: '',
    };

    /*
      Mounted currently makes sure that the date drowdowns are located correctly
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
      this.filterValues.selfBought = false;
      this.filterValues.putInByYou = false;
      this.filterValues.putInForYou = false;
      this.filterValues.filterWay = null;
      this.filterValues.fromDate = '';
      this.filterValues.toDate = '';
    }

    filterUpdated(filterWay : string) : void {
      this.filterValues.filterWay = filterWay;

      this.$emit('input', this.filterValues);
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
