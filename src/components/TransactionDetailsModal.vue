<template>
  <b-modal
    id="details-modal"
    :title="$t('transactionDetailsModal.transaction details')"
    hide-header-close
    centered
    size="lg"
  >
    <p>
      {{ `${this.formatDateTime(transaction.createdAt, full=true)}` +
      ` - ${transaction.formattedDate}` }}
    </p>

    <b-row>
      <b-col cols="6" sm="4">
        <p>{{ $t('transactionDetailsModal.Total') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ dinero({amount: transaction.totalPrice}).toFormat() }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p>{{ $t('transactionDetailsModal.Point of sale') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.pointOfSale }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p>{{ $t('transactionDetailsModal.Put in by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.authorized }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p>{{ $t('transactionDetailsModal.Put in for') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.soldToId }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p>{{ $t('transactionDetailsModal.Activity') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.activityId }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="4">
        <p>{{ $t('transactionDetailsModal.Products') }}</p>
      </b-col>
      <b-col cols="12" sm="8" class="total-price">
        <b-row v-for="trans in transaction.subTransactions"
               v-bind:key="trans.productId"
        >
          <b-col cols="5" sm="6">
            <p class="text-truncate">{{ `${trans.amount} x ${trans.productId}` }}</p>
          </b-col>
          <b-col cols="7" sm="6" class="text-right">
            <p>
              {{ `( ${dinero({amount: trans.pricePerProduct}).toFormat()} ) ` +
              `= ${ dinero({amount: trans.pricePerProduct}).multiply(trans.amount).toFormat()}` }}
            </p>
          </b-col>
        </b-row>
        <hr>
        <b-row>
          <b-col cols="12" class="text-right">
            <p>
              <i class="mr-1">{{ $t('transactionDetailsModal.Total') }} </i>
              {{ dinero({amount: transaction.totalPrice}).toFormat() }}</p>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-button
        variant="primary"
        id="confirm-cancel"
        @click="cancel()"
      >{{ $t('transactionDetailsModal.Cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="ok()"
      >{{ $t('transactionDetailsModal.Flag transaction') }}
      </b-button>
    </template>

  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop,
} from 'vue-property-decorator';
import dinero from 'dinero.js';
import { Transaction } from '@/entities/Transaction';
import Formatters from '@/mixins/Formatters';

  @Component
export default class TransactionDetailsModal extends Formatters {
    @Prop() private transaction!: Transaction;

    /*
      Function to make dinero usable in the template
    */
    dinero: Function = dinero;
}
</script>

<style lang="scss" scoped>
  .modal-body {
    .row p {
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .total-price > div:nth-last-of-type(2) {
      div:last-of-type > p {
        margin-right: -11px;
      }

      div:last-of-type > p::after {
        content: ' +'
      }
    }

    hr {
      margin: .25rem 0;
      border-color: black;
    }
  }
</style>
