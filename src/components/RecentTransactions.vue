<template>
  <div>
    <b-card>
      <b-card-title>
        {{ $t('recentTrans.recent transactions') }}
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm"
                 small
                 borderless
                 thead-class="table-header"
                 :items="transactionList"
                 :fields="fields">
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
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';

  @Component
export default class RecentTransactions extends Formatters {
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
    this.transactionList = fakeTransactions.fetchTransactions({} as User);

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
