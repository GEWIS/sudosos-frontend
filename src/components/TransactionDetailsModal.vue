<template>
  <div>
    <ConfirmationModal
      :title="$t('c_transactionDetailsModal.Confirm deletion').toString()"
      :reason="$t('c_transactionDetailsModal.Are you sure delete').toString()"
      :id="deleteConfirmDialogId"
      @confirmed="confirmTransactionDelete">
    </ConfirmationModal>

    <b-modal
      id="details-modal"
      :title="$t('c_transactionDetailsModal.transaction details')"
      hide-header-close
      centered
      size="lg"
    >
      <p>
        {{ `${this.formatDateTime(trans.updatedAt, full=true)}` +
      ` - ${this.formatDateTime(trans.updatedAt)}` }}
      </p>

      <TransactionDetails v-if="'pointOfSale' in trans" :transaction="trans" />
      <TransferDetails v-else :transfer="trans" />

      <template #modal-header>
        <div class="w-100 d-flex justify-content-center align-items-center">
          <h5 class="modal-title flex-grow-1">
            {{ $t('c_transactionDetailsModal.transaction details') }}
          </h5>
          <div>
            <b-button
              v-b-modal="deleteConfirmDialogId"
            >
              <font-awesome-icon
                icon="trash"
                class="icon"
              />
            </b-button>
          </div>
        </div>
      </template>

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
import Formatters from '@/mixins/Formatters';
import { Transaction } from '@/entities/Transaction';
import { Transfer } from '@/entities/Transfer';
import TransactionDetails from '@/components/TransactionDetails.vue';
import TransferDetails from '@/components/TransferDetails.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { deleteTransaction } from '@/api/transactions';

@Component({
  components: {
    ConfirmationModal,
    TransactionDetails,
    TransferDetails,
  },
})
export default class TransactionDetailsModal extends Formatters {
  @Prop() trans!: Transaction | Transfer;

  flagReasonText: string | null = null;

  saveFlaggedTransaction() {
    if (this.flagReasonState !== null) {
      const flagTrans = {
        reason: this.flagReasonText,
        transaction: this.trans,
      };
      // this.flaggedTransactionState.addFlaggedTransaction(flagTrans);
      this.$bvModal.hide('flag-modal');
    } else {
      this.flagReasonText = '';
    }
  }

  get flagReasonValid(): string {
    if (!this.flagReasonState) {
      return this.$t('c_transactionDetailsModal.flag invalid').toString();
    }

    return '';
  }

  get flagReasonState(): boolean | null {
    if (this.flagReasonText === null) {
      return null;
    }

    return this.flagReasonText.length > 0;
  }

  // eslint-disable-next-line class-methods-use-this
  get deleteConfirmDialogId(): string {
    return 'confirmation-delete-transaction';
  }

  private async confirmTransactionDelete(): Promise<void> {
    if ('pointOfSale' in this.trans) {
      await deleteTransaction(this.trans.id);
      this.$emit('updatedTransaction');
      this.$bvModal.hide('details-modal');
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
