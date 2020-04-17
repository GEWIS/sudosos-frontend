<template>
  <div>
  <b-modal
    id="details-modal"
    :title="$t('transactionDetailsModal.transaction details')"
    hide-header-close
    centered
    size="lg"
    no-stacking
  >
    <p>
      {{ `${this.formatDateTime(transaction.createdAt, full=true)}` +
      ` - ${transaction.formattedDate}` }}
    </p>

    <TransactionDetails :transaction="transaction"></TransactionDetails>

    <template v-slot:modal-footer="{ ok, cancel }">
      <b-button
        variant="primary"
        id="details-cancel"
        @click="cancel()"
      >{{ $t('transactionDetailsModal.Cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        v-b-modal.flag-modal
      >{{ $t('transactionDetailsModal.Flag transaction') }}
      </b-button>
    </template>
  </b-modal>

  <b-modal
    id="flag-modal"
    :title="$t('transactionDetailsModal.Flag transaction')"
    hide-header-close
    centered
    size="lg"
    no-stacking
  >

    <b-form-group
      id="flag-reason"
      :label="$t('transactionDetailsModal.flag reason')"
      label-for="reason-input"
      :invalid-feedback="flagReasonValid"
      :state="flagReasonState"
    >

      <b-form-textarea
        id="flag-reason-text"
        v-model="flagReasonText"
        :placeholder="$t('transactionDetailsModal.reason placeholder')"
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
  </div>
</template>

<script lang="ts">
import {
  Component, Prop,
} from 'vue-property-decorator';
import { Transaction } from '@/entities/Transaction';
import Formatters from '@/mixins/Formatters';
import TransactionDetails from '@/components/TransactionDetails.vue';

  @Component({
    components: {
      TransactionDetails,
    },
  })
export default class TransactionDetailsModal extends Formatters {
    @Prop() private transaction!: Transaction;

    flagReasonText: string = '';

    get flagReasonValid(): string {
      if (!this.flagReasonState) {
        return this.$t('transactionDetailsModal.flag invalid').toString();
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
