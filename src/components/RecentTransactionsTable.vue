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
          :items="mutations.records"
          :busy="!loaded"
          :fields="fields"
          sort-by="createdAt"
          :sort-desc="true"
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
import { Component } from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import getUserFinancialMutations from '@/api/financialMutations';
import { FinancialMutationList } from '@/entities/FinancialMutation';

@Component
export default class RecentTransactionsTable extends Formatters {
  mutations: FinancialMutationList = {} as FinancialMutationList;

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
    this.mutations = await getUserFinancialMutations(
      this.userState.user.id,
      // {} as TransactionFilter,
      10,
      0,
    );
    console.error(this.mutations);

    this.loaded = true;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_recentTransactionsTable');
    });
  }
}

</script>

<style scoped lang="scss">
@import './src/styles/Card.scss';
</style>
