<template>
  <div>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Total') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.price.toFormat() }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Point of sale') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.pointOfSale.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Bought by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.from.name }}</p>
      </b-col>
    </b-row>
    <b-row v-if="Object.keys(transaction.createdBy).length !== 0">
      <b-col cols="6" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Put in by') }}</p>
      </b-col>
      <b-col cols="6" sm="8" class="text-right text-sm-left">
        <p>{{ transaction.createdBy.name }}</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="4">
        <p class="font-weight-bold">{{ $t('c_transactionDetails.Products') }}</p>
      </b-col>
      <b-col cols="12" sm="8" class="total-price">
        <div
          v-for="subTransaction in transaction.subTransactions"
          v-bind:key="subTransaction.id"
        >
          <b-row
            v-for="subTransRow in subTransaction.subTransactionRows"
            v-bind:key="subTransRow.id"
          >
            <b-col cols="5" sm="6">
              <p class="text-truncate">{{`${subTransRow.amount} x ${subTransRow.product.name}`}}</p>
            </b-col>
            <b-col cols="7" sm="6" class="text-right">
              <p>
                {{ `( ${ subTransRow.product.price.toFormat() } ) ` +
              `= ${ subTransRow.price.toFormat()}` }}
              </p>
            </b-col>
          </b-row>
        </div>
        <hr>
        <b-row>
          <b-col cols="12" class="text-right">
            <p>
              <i class="mr-1">{{ $t('c_transactionDetails.Total') }} </i>
              {{ transaction.price.toFormat() }}</p>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Transaction } from '@/entities/Transaction';

@Component
export default class TransactionDetails extends Vue {
  @Prop() transaction: Transaction | undefined;
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
