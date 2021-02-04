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
          :items="transactionList"
          :fields="fields"
        />
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
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import TransactionModule from '@/store/modules/transactions';

@Component
export default class RecentTransactions extends Formatters {
  private transactionState = getModule(TransactionModule);

  transactionList: Transaction[] = [];

  fields: Object[] = [
    {
      key: 'createdAt',
      label: this.getTranslation('recentTrans.when'),
      formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      locale_key: 'when',
    },
    {
      key: 'comment',
      label: this.getTranslation('recentTrans.what'),
      locale_key: 'what',
    },
  ];

  beforeMount() {
    this.transactionState.fetchTransactions();
    this.transactionList = this.transactionState.transactions;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'recentTrans');
    });
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
