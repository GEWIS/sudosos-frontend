<template>
  <div>
    <b-card no-body>
      <b-card-title>
        {{ $t('c_recentTransactionsTable.recent transactions') }}
      </b-card-title>
      <b-card-body>
        <b-table
          stacked="sm"
          class="mb-0"
          small
          borderless
          thead-class="table-header"
          :items="transList"
          :busy="!loaded"
          :fields="fields"
          show-empty
        >
          <!-- If the table data is still loading display something nice -->
          <template #table-busy>
            <div class="text-center text-muted mt-5 mb-3">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <template #empty>
            <div class="text-center text-muted mt-5 mb-3">
              {{ $t('c_transactionsTable.Empty') }}
            </div>
          </template>

          <!-- Templates for each row cell -->
          <template v-slot:cell(id)="data">
            {{ setDescription(data.item) }}
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      <router-link id="TransactionLink" to="/transactions" custom v-slot="{ navigate }">
        <span @click="navigate" @keypress.enter="navigate" role="link">
              {{ $t('c_recentTransactionsTable.all transactions') }}
        </span>
      </router-link>
    </b-card-footer>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { Transaction, TransactionFilter, TransactionList } from '@/entities/Transaction';
import { Transfer, TransferFilter, TransferList } from '@/entities/Transfer';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import { getUserTransactions } from '@/api/transactions';
import { getUserTransfers } from '@/api/transfers';

@Component
export default class RecentTransactionsTable extends Formatters {
  transList: (Transaction | Transfer)[] = [];

  // List with all transfers and pagination information
  transfers: TransferList = {} as TransferList;

  // List with all transactions and pagination information
  transactions: TransactionList = {} as TransactionList;

  loaded = false;

  fields: Object[] = [
    {
      key: 'updatedAt',
      label: this.getTranslation('c_recentTransactionsTable.when'),
      formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      locale_key: 'when',
    },
    {
      key: 'id',
      label: this.getTranslation('c_recentTransactionsTable.what'),
      locale_key: 'what',
    },
  ];

  async beforeMount() {
    this.loaded = false;
    await this.userState.fetchUser();
    console.error(this.userState.user);
    this.transactions = await getUserTransactions(
      this.userState.user.id,
      {} as TransactionFilter,
      10,
      0,
    );

    this.transfers = await getUserTransfers(
      this.userState.user.id,
      {} as TransferFilter,
      10,
      0,
    );
    this.loaded = true;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_recentTransactionsTable');
    });
  }

  @Watch('transactions', { deep: true })
  onTransactionsChanged() {
    this.setTransList();
  }

  @Watch('transfers', { deep: true })
  onTransfersChanged() {
    this.setTransList();
  }

  setTransList() {
    this.transList = this.concat(this.transactions.records, this.transfers.records);
    this.transList.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    this.transList = this.transList.slice(0, 10);
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
