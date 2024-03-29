<template>
  <div>
    <b-card>
      <template v-slot:header>
        <b-form-group
          id="name-filter-group"
          :label="$t('c_borrelkaartTable.Filter by name')"
          label-for="filter"
          label-cols-md="2"
          label-cols="12"
        >
          <b-form-input
            id="filter"
            v-model="filter"
            type="text"
            :placeholder="$t('c_borrelkaartTable.Fill in a name')"
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
          :filter-included-fields="['name', 'ean']"
          :items="userState.allUsers"
          :busy="userState.allUsers.length === 0"
          :fields="fields"
          :per-page="perPage"
          v-on:filtered="filterFinished"
          :current-page="currentPage"
          v-on:row-clicked="rowClicked"
        >
          <!-- If the table data is still loading display something nice -->
          <template #table-busy>
            <div class="text-center text-muted mt-5 mb-3">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <!-- Templates for each row cell -->
          <template v-slot:cell(gewisID)="data">
            {{ data.item.gewisID }}
          </template>
          <template v-slot:cell(name)="data">
            {{ data.item.name }}
          </template>
          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.value" icon="check-circle"></font-awesome-icon>
          </template>

        </b-table>
      </b-card-body>
    </b-card>

    <b-card-footer v-if="totalRows > perPage" class="d-flex">
      <p class="my-auto h-100">
        {{ $t('c_borrelkaartTable.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        limit="1"
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
/* eslint-disable */
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import Formatters from '@/mixins/Formatters';
import { User } from '@/entities/User';
import eventBus from '@/eventbus';
import { Product } from '@/entities/Product';

@Component
export default class UserTable extends Formatters {
  userState = getModule(UserModule)

  perPage = 2;

  currentPage = 1;

  totalRows = 0;

  filter: string = '';

  fields: Object[] = [
    {
      key: 'gewisID',
      label: this.getTranslation('c_borrelkaartTable.gewisID'),
      locale_key: 'gewisID',
    },
    {
      key: 'name',
      label: this.getTranslation('c_borrelkaartTable.Name'),
      locale_key: 'Name',
    },
    {
      key: 'active',
      label: this.getTranslation('c_borrelkaartTable.Active'),
      locale_key: 'Active',
    },
  ]

  beforeMount() {
    // this.userState.fetchAllUsers();
    // this.totalRows = this.userState.users.size;

    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_borrelkaartTable');
    });
  }

  // eslint-disable-next-line class-methods-use-this
  rowClicked(item: User, index: number, event: object) {
    // console.log(item);
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
