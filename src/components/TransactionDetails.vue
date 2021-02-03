<template>
  <div>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Total') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ transaction.price.toFormat() }}</p>
    </b-col>
  </b-row>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Point of sale') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ transaction.pointOfSale }}</p>
    </b-col>
  </b-row>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Put in by') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ transaction.createdBy }}</p>
    </b-col>
  </b-row>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Put in for') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ transaction.from }}</p>
    </b-col>
  </b-row>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Activity') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ transaction.pointOfSale.name }}</p>
    </b-col>
  </b-row>
  <b-row>
    <b-col cols="12" sm="4">
      <p class="font-weight-bold">{{ $t('transactionDetails.Products') }}</p>
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
            <i class="mr-1">{{ $t('transactionDetails.Total') }} </i>
            {{ transaction.price.toFormat() }}</p>
        </b-col>
      </b-row>
    </b-col>
  </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import { Transaction } from '@/entities/Transaction';

  @Component
export default class TransactionDetails extends Formatters {
    @Prop() private transaction: Transaction | undefined;
}
</script>

<style lang="scss" scoped>
.row p {
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
</style>
