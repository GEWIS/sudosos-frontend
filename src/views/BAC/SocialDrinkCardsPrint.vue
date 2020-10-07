<template>
  <div>
    <p id="print-instructions">{{ $t('socialDrinkCardsPrint.instructions') }}</p>
    <table>
      <tbody>
      <!-- Loop over cards in pairs of two -->
      <tr v-for="group in Math.ceil(socialDrinkCards.length / 2)" :key="group">
        <td v-for="card in 2" :key="cardGroup + card">
          <div class="drinkcard" v-if="socialDrinkCards[group + card - 1]">
            <p><b>{{ $t('socialDrinkCardsPrint.BAr Committee Social drink card') }}</b></p>
            <p>{{ cardGroup.name }}</p>
            <div>
              <img :id="`card-${group + card - 1}`"
                   :alt="socialDrinkCards[group + card - 1].barcode"
              />
            </div>
            <p id="barcode-text">{{ socialDrinkCards[group + card - 1].barcode }}</p>
            <p>{{
                `${$t('socialDrinkCardsPrint.valid')}:
                   ${formatDateTime(cardGroup.validDates.validFrom, false, true)}
                   ${$t('socialDrinkCardsPrint.until')}
                   ${formatDateTime(cardGroup.validDates.validTill, false, true)}`
              }}</p>
            <p>{{ `${$t('socialDrinkCardsPrint.value')}:
                  ${dinero({ amount: socialDrinkCards[group + card - 1].initialValue }).toFormat()}`
              }}</p>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { SocialDrinkCard } from '@/entities/SocialDrinkCard';

import Socialdrinkcards from '@/assets/socialdrinkcards';
import { SocialDrinkCardGroup } from '@/entities/SocialDrinkCardGroup';
import Formatters from '@/mixins/Formatters';

const JsBarcode = require('jsbarcode');

  @Component
export default class SocialDrinkCardsPrint extends Formatters {
    socialDrinkCards: SocialDrinkCard[] = [];

    cardGroup: SocialDrinkCardGroup = {} as SocialDrinkCardGroup;


    beforeMount() {
      this.cardGroup = Socialdrinkcards.getCardGroup();
      this.socialDrinkCards = this.cardGroup.socialDrinkCards;
    }

    mounted() {
      this.$nextTick(() => {
        this.socialDrinkCards.forEach((card, i) => {
          const barCode = `#card-${i + 1}`;
          JsBarcode(barCode, card.barcode, {
            width: 2.05,
            height: 70,
            displayValue: false,
          });
        });
      });
    }
}
</script>

<style lang="scss" scoped>
  table {
    width:1000px;
    margin: 0 auto;
  }

  td {
    width: auto;
    overflow: hidden;
    word-wrap: break-word;
    border: 1px solid black;
  }

  #print-instructions {
    text-align: center;
  }

  .drinkcard {
    #barcode-text {
      margin-top: -0.9rem;
      margin-bottom: 0.5rem;
    }

    > p {
      text-align: center;
      margin-bottom: 0;
    }

    > p:first-of-type {
      margin-top: .5rem;
    }

    > p:last-of-type {
      margin-bottom: .5rem;
    }

    > div > img {
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: auto;
    }
  }

  @media print {
    #print-instructions {
      display: none;
    }

    table {
      width: 100%;
      margin: 0;
    }
  }
</style>
