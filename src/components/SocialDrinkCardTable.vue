<template>
  <div>
    <b-form-group
      id="name-filter-group"
      :label="$t('productTable.Filter by name')"
      label-for="name-filter"
      label-cols-md="2"
      label-cols="12"
    >
      <b-form-input id="name-filter"
                    v-model="nameFilter"
                    type="text"
                    :placeholder="$t('productTable.Fill in a name')"
                    trim></b-form-input>
    </b-form-group>

    <b-form-group
      id="page-amount-group"
      :label="$t('productTable.Products per page')"
      label-for="page-amount"
      label-cols-md="2"
      label-cols="12"
    >
      <b-form-input id="page-amount"
                    v-model="perPage"
                    type="number"
                    inputmode="decimal"
                    min="1"
                    step="1"
                    trim>
      </b-form-input>
    </b-form-group>

    <!--  TODO: Add new social drink group -->

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
      <font-awesome-icon class="icon" icon="info-circle" @click="data.toggleDetails" />
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

    <div class="d-flex pageination py-3" v-if="totalRows > perPage">
      <p class="my-auto h-100">
        {{ $t('productTable.Page') }}:
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

    perPage: number = 4;

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
</style>
