<template>
  <div>
    <p id="print-instructions">{{ $t('socialDrinkCardsPrint.instructions') }}</p>
    <table>
      <tbody>
      <!-- Loop over cards in pairs of two -->
      <tr v-for="group in Math.ceil(socialDrinkCards.length / 2)" :key="group">
        <td v-for="card in 2" :key="cardGroup + card">
          <div class="drinkcard" v-if="(group * 2) + card - 3 < socialDrinkCards.length">
            <p><b>{{ $t('socialDrinkCardsPrint.BAr Committee Social drink card') }}</b></p>
            <p>{{ cardGroup.name }}</p>
            <div>
              <img :id="`card-${(group * 2) + card - 3}`"
                   :alt="socialDrinkCards[(group * 2) + card - 3].ean"
              />
            </div>
            <p id="barcode-text">{{ socialDrinkCards[(group * 2) + card - 3].ean }}</p>
            <p v-if="cardGroup.validDates !== undefined">{{
                `${$t('socialDrinkCardsPrint.valid')}:
                   ${formatDateTime(cardGroup.validDates.activeStartDate, false, true)}
                   ${$t('socialDrinkCardsPrint.until')}
                   ${formatDateTime(cardGroup.validDates.activeEndDate, false, true)}`
              }}</p>
            <p>{{ `${$t('socialDrinkCardsPrint.value')}:
                  ${socialDrinkCards[(group * 2) + card - 3].balance.balance.toFormat()}`
              }}</p>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { User } from '@/entities/User';
import { BorrelkaartGroup } from '@/entities/BorrelkaartGroup';
import Formatters from '@/mixins/Formatters';
import BorrelkaartGroupModule from '@/store/modules/borrelkaartgroup';

const JsBarcode = require('jsbarcode');

  @Component
export default class BorrelkaartenPrint extends Formatters {
    @Prop() id!: number;

    private borrelkaartGroupState = getModule(BorrelkaartGroupModule);

    socialDrinkCards: User[] = [];

    cardGroup: BorrelkaartGroup = {} as BorrelkaartGroup;

    beforeMount() {
      this.borrelkaartGroupState.fetchBorrelkaartGroups();
      const kaarten = this.borrelkaartGroupState.borrelkaartGroups;
      const index = kaarten.findIndex((krt) => krt.id === Number(this.id));
      this.cardGroup = kaarten[index];
      this.socialDrinkCards = this.cardGroup.borrelkaarten;
    }

    mounted() {
      this.$nextTick(() => {
        this.socialDrinkCards.forEach((card, i) => {
          const ean = `#card-${i}`;
          JsBarcode(ean, card.ean, {
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
