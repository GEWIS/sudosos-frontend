<template>
  <div>
    <b-card>
      <b-card-title>
        {{ $t('recentTrans.recent transactions') }}
      </b-card-title>
      <b-card-body>
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header"
          :items="transList"
          :fields="fields"
        >
          <!-- Templates for each row cell -->
          <template v-slot:cell(id)="data">
            {{ setDescription(data.item) }}
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link id="TransactionLink" to="/transactions">
        {{ $t('recentTrans.all transactions') }}
      </router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { Transaction } from '@/entities/Transaction';
import { Transfer } from '@/entities/Transfer';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import TransactionModule from '@/store/modules/transactions';
import TransferModule from '@/store/modules/transfers';
import UserModule from '@/store/modules/user';

@Component
export default class RecentTransactions extends Formatters {
  private transactionState = getModule(TransactionModule);

  private transferState = getModule(TransferModule);

  private userState = getModule(UserModule)

  transList: (Transaction | Transfer)[] = [];

  fields: Object[] = [
    {
      key: 'updatedAt',
      label: this.getTranslation('recentTrans.when'),
      formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      locale_key: 'when',
    },
    {
      key: 'id',
      label: this.getTranslation('recentTrans.what'),
      locale_key: 'what',
    },
  ];

  beforeMount() {
    this.transactionState.fetchTransactions();
    this.userState.fetchUser();
    this.transferState.fetchTransfers();
    this.transList = [...this.transactionState.transactions, ...this.transferState.transfers];
    this.transList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'recentTrans');
    });
  }

  /**
   * Sets the correct translation for what happened with the transaction
   *
   * @param {Transaction} trans : Transaction or transfer that we need description for
   */
  setDescription(trans: Transaction | Transfer) {
    // We have a transactions
    if ('pointOfSale' in trans) {
      const { id } = this.userState.user;

      // This is a transaction you put in for someone else
      if (trans.createdBy !== undefined
        && Object.keys(trans.createdBy).length > 0
        && trans.createdBy.id === id
        && trans.from.id !== id) {
        return this.$t('transactionsComponent.transactionPutFor', { name: trans.from.firstname, amount: trans.price.toFormat() });
      }

      // This is a transaction that was put in for you by someone else
      if (trans.createdBy !== undefined
        && Object.keys(trans.createdBy).length > 0
        && trans.from.id === id
        && trans.createdBy.id !== id) {
        return this.$t('transactionsComponent.transactionPutBy', { name: trans.createdBy.firstname, amount: trans.price.toFormat() });
      }

      return this.$t('transactionsComponent.transaction', { amount: trans.price.toFormat() });
    }

    if (trans.description !== undefined) {
      return trans.description;
    }

    return this.$t('recentTrans.transfer', { amount: trans.amount.toFormat() });
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
