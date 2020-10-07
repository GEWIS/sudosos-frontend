<template>
  <div>
    <div class="w-100 text-right mb-2">
      <b-button
        variant="success"
        id="add"
        class=""
        v-b-modal.modal-add>
        <font-awesome-icon icon="plus"></font-awesome-icon>
        {{ $t('socialDrinkCardTable.Add social drink cards') }}
      </b-button>
    </div>

    <b-form-group
      id="name-filter-group"
      :label="$t('socialDrinkCardTable.Filter by name')"
      label-for="name-filter"
      label-cols-md="3"
      label-cols="12"
    >
      <b-form-input
        id="name-filter"
        v-model="nameFilter"
        type="text"
        :placeholder="$t('socialDrinkCardTable.Fill in a name')"
        trim />
    </b-form-group>

    <b-form-group
      id="page-amount-group"
      :label="$t('socialDrinkCardTable.Social drink cards per page')"
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

    <b-table stacked="sm"
             small
             borderless
             striped
             thead-class="table-header table-header-5"
             :items="socialDrinkCards"
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

      <template v-slot:cell(amount)="data">
        {{ data.item.amount }}
      </template>

      <template v-slot:cell(amountActive)="data">
        {{ data.item.amountActive }}
      </template>

      <template v-slot:cell(validDates)="data">
      <span v-if="data.item.validDates">
        {{ $t('socialDrinkCardTable.From') }}
        {{ formatDateTime(data.item.validDates.validFrom, true) }} <br>
        {{ $t('socialDrinkCardTable.Till') }}
        {{ formatDateTime(data.item.validDates.validTill, true) }}
      </span>
        <span v-else>
        {{ $t('socialDrinkCardTable.Forever') }}
      </span>
      </template>

      <template v-slot:cell(owner)="data">
        <div class="text-md-right">
        <font-awesome-icon
          class="icon mr-2"
          icon="file-export"
          @click="$router.push({name: 'socialDrinkCardsPrint', params: {name: data.item.name}})" />
        <font-awesome-icon class="icon" icon="info-circle" @click="data.toggleDetails" />
        </div>
      </template>

      <template v-slot:row-details="row">
        <b-table stacked="sm"
                 small
                 borderless
                 thead-class="table-header"
                 tbody-tr-class="details-table-tr"
                 class="details-table"
                 :items="row.item.socialDrinkCards"
                 :fields="detailFields"
        >
          <!-- Templates for each row cell -->
          <template v-slot:cell(barcode)="data">
            {{ data.item.barcode }}
          </template>

          <template v-slot:cell(activated)="data">
            <font-awesome-icon v-if="data.item.activated" icon="check-circle" />
          </template>

          <template v-slot:cell(initialValue)="data">
            {{ dinero({ amount: data.item.initialValue }).toFormat() }}
          </template>

          <template v-slot:cell(card.saldo)="data">
            {{ dinero({ amount: data.item.card.saldo }).toFormat() }}
          </template>

        </b-table>
      </template>
    </b-table>

    <!--  Pagination  -->
    <div class="d-flex pageination" v-if="totalRows > perPage">
      <p class="my-auto h-100">
        {{ $t('socialDrinkCardTable.Page') }}:
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
      :ok-title="$t('socialDrinkCardTable.save')"
      :cancel-title="$t('socialDrinkCardTable.cancel')"
      :title="$t('socialDrinkCardTable.new social drink cards')"
      size="lg"
      hide-header-close
      centered>
      <div id="add-modal-input">
        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('socialDrinkCardTable.Name')"
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
          :label="$t('socialDrinkCardTable.Amount of cards')"
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
          :label="$t('socialDrinkCardTable.Initial value')"
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
          :label="$t('socialDrinkCardTable.Valid from')"
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
          :label="$t('socialDrinkCardTable.Valid till')"
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
        >{{ $t('socialDrinkCardTable.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="addNewCards">
          {{ $t('socialDrinkCardTable.save') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import { SocialDrinkCardGroup } from '@/entities/SocialDrinkCardGroup';

import Socialdrinkcards from '@/assets/socialdrinkcards';

  @Component
export default class SocialDrinkCardTable extends Formatters {
    socialDrinkCards: SocialDrinkCardGroup[] = [];

    nameFilter: string = '';

    currentPage: number = 1;

    previousPage: number = 0;

    totalRows: number = 0;

    perPage: number = 12;

    newCardName: String = '';

    newCardAmount: Number = 0;

    newCardInitialValue: Number = 0;

    newCardFromDate: Date | null = null;

    newCardToDate: Date | null = null;

    fields: Object[] = [
      {
        key: 'name',
        label: this.getTranslation('socialDrinkCardTable.Name'),
        locale_key: 'Name',
      },
      {
        key: 'amount',
        label: this.getTranslation('socialDrinkCardTable.Total amount'),
        locale_key: 'Total amount',
      },
      {
        key: 'amountActive',
        label: this.getTranslation('socialDrinkCardTable.Activated amount'),
        locale_key: 'Activated amount',
      },
      {
        key: 'validDates',
        label: this.getTranslation('socialDrinkCardTable.Validity'),
        locale_key: 'Validity',
      },
      {
        key: 'owner',
        label: this.getTranslation('socialDrinkCardTable.Info'),
        locale_key: 'Info',
      },
    ];

    detailFields: Object[] = [
      {
        key: 'barcode',
        label: this.getTranslation('socialDrinkCardTable.Barcode'),
        locale_key: 'Barcode',
      },
      {
        key: 'activated',
        label: this.getTranslation('socialDrinkCardTable.Active'),
        locale_key: 'Active',
      },
      {
        key: 'initialValue',
        label: this.getTranslation('socialDrinkCardTable.Initial value'),
        locale_key: 'Initial value',
      },
      {
        key: 'card.saldo',
        label: this.getTranslation('socialDrinkCardTable.Current value'),
        locale_key: 'Current value',
      },
    ];

    beforeMount() {
      this.socialDrinkCards = this.formatSocialDrinkCards(
        Socialdrinkcards.getGroups(),
      );

      this.totalRows = this.socialDrinkCards.length;

      // If the locale is changed make sure the labels are also correctly updated for the b-table
      eventBus.$on('localeUpdated', () => {
        this.fields = this.updateTranslations(this.fields, 'socialDrinkCardTable');
        this.detailFields = this.updateTranslations(this.detailFields, 'socialDrinkCardTable');
      });
    }

    /**
     * Formats the cardgroups such that Total amount of cards and amount of cards activated
     * are displayed properly
     *
     * @param cardGroup: SocialDrinkCardGroup list
     */
    formatSocialDrinkCards = (cardGroup: SocialDrinkCardGroup[]) => {
      const formattedCards: SocialDrinkCardGroup[] = [];

      cardGroup.forEach((g) => {
        g.amount = g.socialDrinkCards.length;
        let amountActive = 0;

        g.socialDrinkCards.forEach((c) => {
          if (c.activated) {
            amountActive += 1;
          }
        });

        g.amountActive = amountActive;
        formattedCards.push(g);
      });

      return formattedCards;
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
     * @param socialDrinkCards
     * @param length
     */
    filterFinished(socialDrinkCards: SocialDrinkCardGroup[], length: number): void {
      this.currentPage = 1;
      this.totalRows = length;
    }

    /**
     * Once the OK button is pressed the new cards should be made
     */
    addNewCards(): void {
      // TODO: Make request to add new cards

      this.currentPage = this.currentPage;
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
        return this.$t('socialDrinkCardTable.Name need to be larger than 0 characters').toString();
      }

      return '';
    }

    get newCardAmountState(): boolean {
      return this.newCardAmount > 0;
    }

    get newCardAmountInvalid(): String {
      if (!this.newCardAmountState) {
        return this.$t('socialDrinkCardTable.Amount of cards needs to be larger than 0').toString();
      }

      return '';
    }

    get newCardInitialValueState(): boolean {
      return this.newCardInitialValue >= 0;
    }

    get newCardInitialValueInvalid(): String {
      if (!this.newCardInitialValueState) {
        return this.$t('socialDrinkCardTable.Initial value needs to be 0 or larger').toString();
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
        return this.$t('socialDrinkCardTable.From date needs a date earlier than till date').toString();
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
        return this.$t('socialDrinkCardTable.Till date needs a date later than from date').toString();
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
