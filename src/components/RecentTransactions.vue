<template>
  <div>
    <b-card>
      <b-card-title>
        {{ $t('recentTrans.recent transactions') }}
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
        :items="transactionList" :fields="fields">
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TranslateResult } from 'vue-i18n';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';
import Formatters from '@/mixins/Formatters';

@Component
export default class RecentTransactions extends Formatters {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList: Transaction[] = [];

  fields: Object[] = [
    {
      key: 'createdAt',
      label: this.getTranslation('recentTrans.when'),
      formatter: (value: Date) => this.formatDateTime(value, undefined, true),
    },
    {
      key: 'comment',
      label: this.getTranslation('recentTrans.what'),
    },
  ];

  beforeMount() {
    this.transactionList = fakeTransactions.fetchTransactions(this.user);
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
