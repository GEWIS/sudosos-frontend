<template>
  <div>
    <b-modal
      id="details-modal"
      :title="$t('c_transactionDetailsModal.transaction details')"
      hide-header-close
      centered
      size="lg"
      no-stacking
    >
      <p>
        {{ `${this.formatDateTime(trans.updatedAt, full=true)}` +
      ` - ${this.formatDateTime(trans.updatedAt)}` }}
      </p>

      <TransactionDetails v-if="'pointOfSale' in trans" :transaction="trans" />
      <TransferDetails v-else :transfer="trans" />

      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button
          variant="primary"
          id="details-cancel"
          @click="cancel()"
        >{{ $t('c_transactionDetailsModal.Cancel') }}
        </b-button>
        <b-button
          v-if="'pointOfSale' in trans"
          variant="primary"
          class="btn-empty"
          v-b-modal.flag-modal
        >{{ $t('c_transactionDetailsModal.Flag transaction') }}
        </b-button>
      </template>
    </b-modal>

    <b-modal
      id="flag-modal"
      :title="$t('c_transactionDetailsModal.Flag transaction')"
      hide-header-close
      centered
      size="lg"
      no-stacking
    >

      <b-form-group
        id="flag-reason"
        :label="$t('c_transactionDetailsModal.flag reason')"
        label-for="reason-input"
        :invalid-feedback="flagReasonValid"
        :state="flagReasonState"
      >

        <b-form-textarea
          id="flag-reason-text"
          v-model="flagReasonText"
          :placeholder="$t('c_transactionDetailsModal.reason placeholder')"
          rows="3"
          max-rows="6"
          no-resize
        ></b-form-textarea>
      </b-form-group>

      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button
          variant="primary"
          id="flag-cancel"
          @click="cancel()"
        >{{ $t('c_transactionDetailsModal.Cancel') }}
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="saveFlaggedTransaction"
        >{{ $t('c_transactionDetailsModal.Flag transaction') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import { Transaction } from '@/entities/Transaction';
import { Transfer } from '@/entities/Transfer';
import TransactionDetails from '@/components/TransactionDetails.vue';
import TransferDetails from '@/components/TransferDetails.vue';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';

@Component({
  components: {
    TransactionDetails,
    TransferDetails,
  },
})
export default class TransactionDetailsModal extends Formatters {
  @Prop() trans!: Transaction | Transfer;

  private flaggedTransactionState = getModule(FlaggedTransactionModule);

  flagReasonText: string = '';

  beforeMount() {
    this.flaggedTransactionState.fetchFlaggedTransactions();
  }

  saveFlaggedTransaction() {
    if (this.flagReasonState) {
      const flagTrans = {
        reason: this.flagReasonText,
        transaction: this.trans,
      };
      this.flaggedTransactionState.addFlaggedTransaction(flagTrans);
      this.$bvModal.hide('flag-modal');
    }
  }

  get flagReasonValid(): string {
    if (!this.flagReasonState) {
      return this.$t('c_transactionDetailsModal.flag invalid').toString();
    }

    return '';
  }

  get flagReasonState(): boolean {
    return this.flagReasonText !== '';
  }
}
</script>

<style lang="scss" scoped>

</style>
