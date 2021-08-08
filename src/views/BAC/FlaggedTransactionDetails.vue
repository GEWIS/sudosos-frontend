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
          {{ $t('flaggedDetails.accept manual') }}
        </b-button>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { FlaggedTransaction } from '@/entities/FlaggedTransaction';
import TransactionDetails from '@/components/TransactionDetails.vue';
import { getModule } from 'vuex-module-decorators';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';
import Formatters from '../../mixins/Formatters';

@Component({
  components: {
    TransactionDetails,
  },
})
export default class FlaggedTransactionDetails extends Formatters {
    @Prop() transactionID!: number;

    flaggedTransactionModule = getModule(FlaggedTransactionModule)

    flaggedTransaction: FlaggedTransaction = {} as FlaggedTransaction;

    flagReasonText: string = '';

    beforeMount() {
      const id = Number(this.$route.params.id) || this.transactionID;

      const index = this.flaggedTransactionModule.flaggedTransactions.findIndex(
        (flg) => flg.id === id,
      );
      this.flaggedTransaction = this.flaggedTransactionModule.flaggedTransactions[index];
    }
}
</script>

<style lang="scss" scoped>
.row p {
  margin-bottom: 0.25rem;
}
</style>
