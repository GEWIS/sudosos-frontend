<template>
  <div>
    <b-card>
      <b-card-title>
        {{ $t('recentTrans.recent transactions') }}
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
        :items="transactionList" :fields="fields">
          <template v-slot:head(createdAt)="data">
            <span v-if="data">{{ $t(`recentTrans.${data.label}`) }}</span>
          </template>

          <template v-slot:head(comment)="data">
            <span v-if="data">{{ $t(`recentTrans.${data.label}`) }}</span>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TranslateResult } from 'vue-i18n';
import { User } from '@/entities/User';
import { Transaction } from '@/entities/Transaction';
import fakeTransactions from '@/assets/transactions';

@Component
export default class RecentTransactions extends Vue {
  @Prop({ type: Object as () => User }) private user!: User;

  transactionList: Transaction[] = [];

  getTimeString = (value: Date) => `${RecentTransactions.parseTime(value.getDate())}-`
                                    + `${RecentTransactions.parseTime(value.getMonth() + 1)}-`
                                    + `${value.getFullYear()} - `
                                    + `${RecentTransactions.parseTime(value.getHours())}:`
                                    + `${RecentTransactions.parseTime(value.getMinutes())}`;

  fields: Object[] = [
    {
      key: 'createdAt',
      label: 'when',
      formatter: (value: Date) => this.getTimeString(value),
    },
    {
      key: 'comment',
      label: 'what',
    },
  ];

  beforeMount() {
    this.transactionList = fakeTransactions.fetchTransactions(this.user);
  }

  static parseTime(value: number): string {
    return (value < 10 ? '0' : '') + value;
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
