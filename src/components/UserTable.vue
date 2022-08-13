<template>
<div>
  <b-card>
    <template v-slot:header>
      <b-form-group
        id="name-filter-group"
        :label="$t('c_userTable.Filter by name')"
        label-for="filter"
        label-cols-md="2"
        label-cols="12"
      >
        <b-form-input
          id="filter"
          v-model="filter"
          type="text"
          :placeholder="$t('c_userTable.Fill in a name')"
          trim
        />
      </b-form-group>
    </template>
    <b-card-body>
      <b-table
        stacked="sm"
        small
        borderless
        striped
        hover
        thead-class="table-header table-header-4"
        id="user-table"
        tbody-tr-class="user-row"
        :filter="filter"
        :filter-included-fields="['name', 'gewisID']"
        :items="users"
        :busy="!loaded"
        :fields="fields"
        :per-page="perPage"
        v-on:filtered="filterFinished"
        v-on:row-clicked="rowClicked"
      >
        <!-- If the table data is still loading display something nice -->
        <template #table-busy>
          <div class="text-center text-muted mt-5 mb-3">
            <b-spinner class="align-middle"></b-spinner>
          </div>
        </template>

        <!-- Templates for each row cell -->
        <template v-slot:cell(gewisId)="data">
          {{ data.item.gewisId }}
        </template>
        <template v-slot:cell(name)="data">
          {{ data.item.name }}
        </template>
        <template v-slot:cell(active)="data">
          <font-awesome-icon :icon="Boolean(data.item.active) ? 'check-circle' : ''" />
        </template>

      </b-table>
    </b-card-body>
  </b-card>

  <b-card-footer v-if="totalRows > perPage" class="d-flex">
    <p class="my-auto h-100">
      {{ $t('c_userTable.Page') }}:
    </p>
    <b-pagination
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      limit="1"
      @page-click="fetchNewItems"
      next-class="nextButton"
      prev-class="prevButton"
      page-class="pageButton"
      hide-goto-end-buttons
      last-number
      aria-controls="transaction-table"
      class="custom-pagination mb-0"
    ></b-pagination>
  </b-card-footer>
</div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import Formatters from '@/mixins/Formatters';
import { User } from '@/entities/User';
import eventBus from '@/eventbus';
import { Product } from '@/entities/Product';
import { getPOSTransactions, getUserTransactions } from '@/api/transactions';
import { getUserTransfers } from '@/api/transfers';
import { TransferFilter } from '@/entities/Transfer';
import { getUsers } from '@/api/users';

@Component
export default class UserTable extends Formatters {
  // userState = getModule(UserModule)

  users: User[] = [];

  perPage = 10;

  currentPage = 1;

  totalRows = 0;

  filter: string = '';

  loaded = false;

  fields: Object[] = [
    {
      key: 'gewisId',
      label: this.getTranslation('c_userTable.gewisID'),
      locale_key: 'gewisID',
    },
    {
      key: 'name',
      label: this.getTranslation('c_userTable.Name'),
      locale_key: 'Name',
    },
    {
      key: 'active',
      label: this.getTranslation('c_userTable.Active'),
      locale_key: 'Active',
    },
  ]

  beforeMount() {
    this.fetchNewData();
    this.totalRows = this.userState.allUsers.length;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_userTable');
    });
  }

  // eslint-disable-next-line class-methods-use-this
  rowClicked(item: User, index: number, event: object) {
    this.$router.push({ name: 'userDetails', params: { id: String(item.id) } });
  }

  fetchNewItems(event: any, page: number) {
    this.fetchNewData(page);
  }

  async fetchNewData(page = this.currentPage) {
    this.loaded = false;
    const skip = (page - 1) * this.perPage;
    const take = this.perPage;

    const { records, _pagination } = (await getUsers({ take, skip }));
    this.users = records;

    this.totalRows = _pagination.count;
    this.loaded = true;
  }

  /**
   * Methods that makes sure the pagination functions correctly after sorting
   *
   * @param products
   * @param length
   */
  filterFinished(products: Product[], length: number): void {
    this.currentPage = 1;
    this.totalRows = length;
  }
}
</script>

<style lang="scss" scoped>
@import './src/styles/Card.scss';
</style>
