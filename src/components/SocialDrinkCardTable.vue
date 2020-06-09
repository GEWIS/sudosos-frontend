<template>
  <b-table stacked="sm"
           small
           borderless
           thead-class="table-header table-header-5"
           :items="socialDrinkCards"
           :fields="fields"
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
      <font-awesome-icon icon="info-circle" @click="data.toggleDetails"></font-awesome-icon>
    </template>

    <template v-slot:row-details="row">
      <b-table stacked="sm"
               small
               borderless
               thead-class="table-header"
               :items="row.item.socialDrinkCards"
               :fields="detailFields"
      >
        <!-- Templates for each row cell -->
        <template v-slot:cell(barcode)="data">
          {{ data.item.barcode }}
        </template>

        <template v-slot:cell(activated)="data">
          <font-awesome-icon v-if="data.item.activated" icon="check-circle"></font-awesome-icon>
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
}
</script>

<style scoped>

</style>
