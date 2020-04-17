<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('flaggedDetails.Flagged transaction') }}</h1>
    <hr>
    <b-row>
      <b-col cols="12" lg="6" class="px-4">
        <h5>{{ $t('flaggedDetails.Transaction details')}}</h5>
        <TransactionDetails :transaction="flaggedTransaction.transaction"></TransactionDetails>
      </b-col>
      <b-col cols="12" class="d-inline d-lg-none">
        <hr>
      </b-col>
      <b-col cols="12" lg="6" class="px-4">
        <h5>{{ $t('flaggedDetails.Flag details')}}</h5>
          <b-row>
            <b-col cols="6" sm="4">
              <p class="font-weight-bold">{{ $t('flaggedDetails.status') }}</p>
            </b-col>

            <b-col cols="6" sm="8">
              <p class="text-right text-sm-left">{{ flaggedTransaction.status }}</p>
            </b-col>

            <b-col cols="6" sm="4">
              <p class="font-weight-bold">{{ $t('flaggedDetails.flagged on') }}</p>
            </b-col>

            <b-col cols="6" sm="8">
              <p class="text-right text-sm-left">
                {{ `${this.formatDateTime(flaggedTransaction.createdAt, full=true)}` +
                ` - ${this.formatDateTime(flaggedTransaction.createdAt)}` }}
              </p>
            </b-col>

            <b-col cols="6" sm="4">
              <p class="font-weight-bold">{{ $t('flaggedDetails.flagged by') }}</p>
            </b-col>

            <b-col cols="6" sm="8">
              <p class="text-right text-sm-left">{{ flaggedTransaction.flaggedById }}</p>
            </b-col>

            <b-col cols="12" sm="4">
              <p class="font-weight-bold">{{ $t('flaggedDetails.reason') }}</p>
            </b-col>

            <b-col cols="12" sm="8">
              <p>{{ flaggedTransaction.reason }}</p>
            </b-col>
          </b-row>
      </b-col>
      <b-col cols="12" md="9" class="mt-4">
        <b-form-group
          id="flag-reason"
          label-for="reason-input"
        >

          <b-form-textarea
            id="flag-reason-text"
            v-model="flagReasonText"
            :placeholder="$t('flaggedDetails.comment placeholder')"
            rows="6"
            no-resize
          ></b-form-textarea>
        </b-form-group>
      </b-col>
      <b-col cols="12" md="9">
        <b-button variant="danger" class="mr-3 mt-2">
          <font-awesome-icon icon="times"></font-awesome-icon>
          {{ $t('flaggedDetails.reject') }}
        </b-button>
        <b-button variant="success" class="mr-3 mt-2">
          <font-awesome-icon icon="check"></font-awesome-icon>
          {{ $t('flaggedDetails.accept auto') }}
        </b-button>
        <b-button variant="success" class="mr-3 mt-2">
          <font-awesome-icon icon="check"></font-awesome-icon>
          {{ $t('flaggedDetails.accept manual') }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Formatters from '../../mixins/Formatters';
import { TransactionFlag, FlagStatus } from '@/entities/TransactionFlag';
import { Transaction } from '@/entities/Transaction';
import TransactionDetails from '@/components/TransactionDetails.vue';

function fetchTransaction(): TransactionFlag {
  return {
    id: '001',
    flaggedById: 'Ruben',
    status: FlagStatus.TODO,
    reason:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    createdAt: new Date(),
    updatedAt: new Date(),
    transaction: {
      id: '001',
      soldToId: 'Ruben',
      authorized: 'Ruben',
      totalPrice: 2870,
      pointOfSale: 'Bar (GEWIS)',
      activityId: '001',
      subTransactions: [{
        transactionId: '001',
        productId: '001',
        storageId: '001',
        amount: 2,
        pricePerProduct: 70,
      },
      {
        transactionId: '002',
        productId: '002',
        storageId: '002',
        amount: 5,
        pricePerProduct: 130,
      },
      {
        transactionId: '003',
        productId: '003000000000000000',
        storageId: '003',
        amount: 8,
        pricePerProduct: 260,
      }],
      comment: 'You spent a total of €28.70',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Transaction,
  };
}

    @Component({
      components: {
        TransactionDetails,
      },
    })
export default class FlaggedTransactionDetails extends Formatters {
    @Prop() private transaction!: TransactionFlag;

    flaggedTransaction: TransactionFlag = {} as TransactionFlag;

      flagReasonText: string = '';

      beforeMount() {
        if (this.transaction === undefined) {
          this.flaggedTransaction = fetchTransaction();
        } else {
          this.flaggedTransaction = this.transaction;
        }
      }
}
</script>

<style lang="scss" scoped>
.row p {
  margin-bottom: 0.25rem;
}
</style>
