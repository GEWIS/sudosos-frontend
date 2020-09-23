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
            <p>BARCODE</p>
            <p>{{ socialDrinkCards[group + card - 1].barcode }}</p>
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

  @Component
export default class SocialDrinkCardsPrint extends Formatters {
    socialDrinkCards: SocialDrinkCard[] = [];

    cardGroup: SocialDrinkCardGroup = {};


    beforeMount() {
      this.cardGroup = Socialdrinkcards.getCardGroup();
      this.socialDrinkCards = this.cardGroup.socialDrinkCards;
    }
}
</script>

<style lang="scss" scoped>
  table {
    max-width: 2480px;
    width:100%;
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
    > p {
      text-align: center;
    }
  }

  @media print {
    #print-instructions {
      display: none;
    }
  }
</style>
