<template>
  <div>
    <div class="w-100 text-right mb-2">
      <b-button
        variant="success"
        id="add"
        class=""
        v-b-modal.modal-add>
        <font-awesome-icon icon="plus"></font-awesome-icon>
        {{ $t('borrelkaartTable.Add social drink cards') }}
      </b-button>
    </div>

    <b-form-group
      id="name-filter-group"
      :label="$t('borrelkaartTable.Filter by name')"
      label-for="name-filter"
      label-cols-md="3"
      label-cols="12"
    >
      <b-form-input
        id="name-filter"
        v-model="nameFilter"
        type="text"
        :placeholder="$t('borrelkaartTable.Fill in a name')"
        trim
      />
    </b-form-group>

    <b-form-group
      id="page-amount-group"
      :label="$t('borrelkaartTable.Social drink cards per page')"
      label-for="page-amount"
      label-cols-md="3"
      label-cols="12"
    >
      <b-form-input
        id="page-amount"
        v-model="perPage"
        type="number"
        inputmode="decimal"
        min="1"
        step="1"
        trim
      />
    </b-form-group>

    <b-table
      stacked="sm"
      small
      borderless
      striped
      thead-class="table-header table-header-5 align-last-right"
      :items="borrelkaarten"
      :fields="fields"
      :filter="nameFilter"
      :filter-included-fields="['name']"
      :per-page="perPage"
      :current-page="currentPage"
      v-on:filtered="filterFinished"
    >
      <!-- Templates for each row cell -->
      <template v-slot:cell(name)="data">
        {{ data.item.name }}
      </template>

      <template v-slot:cell(id)="data">
        {{ data.item.borrelkaarten.length }}
      </template>

      <template v-slot:cell(validDates)="data">
      <span v-if="data.item.validDates">
        {{ $t('borrelkaartTable.From') }}
        {{ formatDateTime(data.item.validDates.activeStartDate, true) }} <br>
        {{ $t('borrelkaartTable.Till') }}
        {{ formatDateTime(data.item.validDates.activeEndDate, true) }}
      </span>
        <span v-else>
        {{ $t('borrelkaartTable.Forever') }}
      </span>
      </template>

      <template v-slot:cell(owner)="data">
        <div class="text-md-right">
          <font-awesome-icon
            class="icon mr-2"
            icon="file-export"
            @click="$router.push({name: 'borrelkaartenPrint', params: {id: data.item.id}})" />
          <font-awesome-icon class="icon" icon="info-circle" @click="data.toggleDetails" />
        </div>
      </template>

      <template v-slot:row-details="row">
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header"
          tbody-tr-class="details-table-tr"
          class="details-table"
          :items="row.item.borrelkaarten"
          :fields="detailFields"
        >
          <!-- Templates for each row cell -->
          <template v-slot:cell(barcode)="data">
            {{ data.item.barcode }}
          </template>

          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.item.active" icon="check-circle" />
            <font-awesome-icon v-else icon="times-circle" />
          </template>

          <template v-slot:cell(saldo)="data">
            {{ data.item.saldo.toFormat() }}
          </template>

        </b-table>
      </template>
    </b-table>

    <!--  Pagination  -->
    <div class="d-flex pageination" v-if="totalRows > perPage">
      <p class="my-auto h-100">
        {{ $t('borrelkaartTable.Page') }}:
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
    </div>

    <!--  Adding more Social drink cards modal  -->
    <b-modal
      id="modal-add"
      :ok-title="$t('borrelkaartTable.save')"
      :cancel-title="$t('borrelkaartTable.cancel')"
      :title="$t('borrelkaartTable.new social drink cards')"
      size="lg"
      hide-header-close
      centered>
      <div id="add-modal-input" v-on:keypress.enter="addNewCards">
        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('borrelkaartTable.Name')"
          label-align="left"
          label-for="name"
          :state="newCardNameState"
          :invalid-feedback="newCardNameInvalid"
        >
          <b-form-input
            id="name"
            name="name"
            type="text"
            v-model="newCardName"
            :state="newCardNameState"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('borrelkaartTable.Amount of cards')"
          label-align="left"
          label-for="amount"
          :state="newCardAmountState"
          :invalid-feedback="newCardAmountInvalid"
        >
          <b-form-input
            id="amount"
            name="amount"
            type="number"
            steps="1"
            min="0"
            inputmode="decimal"
            v-model="newCardAmount"
            :state="newCardAmountState"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('borrelkaartTable.Initial value')"
          label-align="left"
          label-for="initial"
          :state="newCardInitialValueState"
          :invalid-feedback="newCardInitialValueInvalid"
        >
          <b-form-input
            id="initial"
            name="initial"
            type="number"
            min="0"
            steps="0.01"
            inputmode="decimal"
            v-model="newCardInitialValue"
            :state="newCardInitialValueState"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('borrelkaartTable.Valid from')"
          label-align="left"
          label-for="date-from"
          :state="newCardFromDateState"
          :invalid-feedback="newCardFromDateInvalid"
        >
          <b-form-datepicker
            id="date-from"
            name="date-from"
            v-model="newCardFromDate"
            :state="newCardFromDateState"
          ></b-form-datepicker>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('borrelkaartTable.Valid till')"
          label-align="left"
          label-for="date-till"
          :state="newCardToDateState"
          :invalid-feedback="newCardToDateInvalid"
        >
          <b-form-datepicker
            id="date-till"
            name="date-till"
            v-model="newCardToDate"
            :state="newCardToDateState"
          ></b-form-datepicker>
        </b-form-group>

      </div>

      <template v-slot:modal-footer="">
        <b-button
          variant="primary"
          class="btn-empty"
          @click="cancelAdding"
        >{{ $t('borrelkaartTable.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="addNewCards">
          {{ $t('borrelkaartTable.save') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import BorrelkaartGroupModule from '@/store/modules/borrelkaartgroup';

@Component
export default class BorrelkaartTable extends Formatters {
  private borrelkaartGroupState = getModule(BorrelkaartGroupModule);

  borrelkaarten: BorrelkaartGroup[] = [];

  nameFilter: string = '';

  currentPage: number = 1;

  previousPage: number = 0;

  totalRows: number = 0;

  perPage: number = 12;

  newCardName: string = '';

  newCardAmount: number = 0;

  newCardInitialValue: number = 0;

  newCardFromDate: Date | null = null;

  newCardToDate: Date | null = null;

  fields: Object[] = [
    {
      key: 'name',
      label: this.getTranslation('borrelkaartTable.Name'),
      locale_key: 'Name',
    },
    {
      key: 'id',
      label: this.getTranslation('borrelkaartTable.Total amount'),
      locale_key: 'Total amount',
    },
    {
      key: 'validDates',
      label: this.getTranslation('borrelkaartTable.Validity'),
      locale_key: 'Validity',
    },
    {
      key: 'owner',
      label: this.getTranslation('borrelkaartTable.Info'),
      locale_key: 'Info',
    },
  ];

  detailFields: Object[] = [
    {
      key: 'ean',
      label: this.getTranslation('borrelkaartTable.Barcode'),
      locale_key: 'Barcode',
    },
    {
      key: 'active',
      label: this.getTranslation('borrelkaartTable.Active'),
      locale_key: 'Active',
    },
    {
      key: 'saldo',
      label: this.getTranslation('borrelkaartTable.Current value'),
      locale_key: 'Current value',
    },
  ];

  beforeMount() {
    this.borrelkaartGroupState.fetchBorrelkaartGroups();
    this.borrelkaarten = this.borrelkaartGroupState.borrelkaartGroups;

    this.totalRows = this.borrelkaarten.length;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'borrelkaartTable');
      this.detailFields = this.updateTranslations(this.detailFields, 'borrelkaartTable');
    });
  }

  /**
   * Method that grabs extra transactions when 2 pages or less are left
   *
   * @param page new page number
   */
  pageClicked(page: number) : void {
    if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
      // TODO: Grab new data
    }

    this.previousPage = page;
  }

  /**
   * Methods that makes sure the pagination functions correctly after sorting
   *
   * @param borrelkaarten
   * @param length
   */
  filterFinished(borrelkaarten: BorrelkaartGroup[], length: number): void {
    this.currentPage = 1;
    this.totalRows = length;
  }

  /**
   * Once the OK button is pressed the new cards should be made
   */
  addNewCards(): void {
    if (this.newCardNameState
      && this.newCardAmountState
      && this.newCardFromDateState
      && this.newCardToDateState) {
      let validDates;

      if (this.newCardFromDate !== null) {
        validDates = {
          activeStartDate: this.newCardFromDate,
          activeEndDate: this.newCardToDate,
        };
      }

      const addGroup = {
        name: this.newCardName,
        amount: this.newCardAmount,
        initialValue: Number(this.newCardInitialValue) * 100,
        validDates,
      };

      this.borrelkaartGroupState.addBorrelkaartGroup(addGroup);
      this.cancelAdding();
    }
  }

  /**
   * If the cancel button on the modal is pressed everything needs to be reset
   */
  cancelAdding(): void {
    this.$bvModal.hide('modal-add');
    this.newCardName = '';
    this.newCardAmount = 0;
    this.newCardInitialValue = 0;
    this.newCardFromDate = null;
    this.newCardToDate = null;
  }

  /**
   * Below are the methods for front-end validation of the form in the modal
   */
  get newCardNameState(): boolean {
    return this.newCardName.length > 0;
  }

  get newCardNameInvalid(): String {
    if (!this.newCardNameState) {
      return this.$t('borrelkaartTable.Name need to be larger than 0 characters').toString();
    }

    return '';
  }

  get newCardAmountState(): boolean {
    return this.newCardAmount > 0;
  }

  get newCardAmountInvalid(): String {
    if (!this.newCardAmountState) {
      return this.$t('borrelkaartTable.Amount of cards needs to be larger than 0').toString();
    }

    return '';
  }

  get newCardInitialValueState(): boolean {
    return this.newCardInitialValue >= 0;
  }

  get newCardInitialValueInvalid(): String {
    if (!this.newCardInitialValueState) {
      return this.$t('borrelkaartTable.Initial value needs to be 0 or larger').toString();
    }

    return '';
  }

  get newCardFromDateState(): boolean {
    if (this.newCardFromDate !== null || this.newCardToDate !== null) {
      const from : Date = this.newCardFromDate || new Date();
      const to : Date = this.newCardToDate || new Date();

      if ((this.newCardFromDate === null && this.newCardToDate !== null) || from >= to) {
        return false;
      }
    }

    return true;
  }

  get newCardFromDateInvalid(): String {
    if (!this.newCardFromDateState) {
      return this.$t('borrelkaartTable.From date needs a date earlier than till date').toString();
    }

    return '';
  }

  get newCardToDateState(): boolean {
    if (this.newCardFromDate !== null || this.newCardToDate !== null) {
      const from : Date = this.newCardFromDate || new Date();
      const to : Date = this.newCardToDate || new Date();

      if ((this.newCardFromDate !== null && this.newCardToDate === null) || from >= to) {
        return false;
      }
    }

    return true;
  }

  get newCardToDateInvalid(): String {
    if (!this.newCardToDateState) {
      return this.$t('borrelkaartTable.Till date needs a date later than from date').toString();
    }

    return '';
  }
}
</script>

<style lang="scss" scoped>
.details-table {
  margin: 0.5rem 1.5rem;
  width: calc(100% - 3rem) !important;

  tbody tr {
    background-color: white !important;
  }
}

.icon {
  color: $gewis-grey;
  cursor: pointer;
}

.icon:hover {
  color: $gewis-grey-shadow;
}

.add-modal-input > div {
  margin: 0.5rem 0;
}
</style>
