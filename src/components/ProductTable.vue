<template>
<div>
  <b-form-group
    id="name-filter-group"
    :label="$t('productTable.Filter by name')"
    label-for="name-filter"
    label-cols-md="2"
    label-cols="12"
  >
    <b-form-input id="name-filter"
                  v-model="nameFilter"
                  type="text"
                  :placeholder="$t('productTable.Fill in a name')"
                  trim></b-form-input>
  </b-form-group>

  <b-table
    :fields="fields"
    :items="productList"
    stacked="sm"
    small
    borderless
    thead-class="table-header"
    :filter="nameFilter"
    :filter-included-fields="['name']"
    :per-page="perPage"
    :current-page="currentPage"
    v-on:filtered="filterFinished"
  >
    <template v-slot:cell(picture)="data">
      <img class="thumbnail" :src="data.value" alt="">
    </template>

    <template v-slot:cell(name)="data">
      {{ data.value }}
    </template>

    <template v-slot:cell(category)="data">
      {{ data.value }}
    </template>

    <template v-slot:cell(price)="data">
      {{ dinero({ amount: data.value}).toFormat() }}
    </template>

    <template v-slot:cell(isAlcoholic)="data">
      {{ data.value ? $t('productTable.Yes') : $t('productTable.No') }}
    </template>

    <template v-slot:cell(negative)="data">
      {{ data.value ? $t('productTable.Yes') : $t('productTable.No') }}
    </template>
  </b-table>

  <div class="d-flex pageination py-3" v-if="totalRows > perPage">
    <p class="my-auto h-100">
      {{ $t('transactionFlagsComponent.Page') }}:
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
      @change="pageClicked"
      aria-controls="transaction-table"
      class="custom-pagination mb-0"
    ></b-pagination>
  </div>
</div>
</template>

<script lang="ts">

import { Component, Prop } from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import { Product } from '@/entities/Product';
import FakeProducts from '@/assets/products';

  @Component
export default class ProductTable extends Formatters {
    @Prop() private productsProp!: Product[];

    nameFilter: string = '';

    productList: Product[] = [];

    currentPage: number = 1;

    previousPage: number = 0;

    totalRows: number = 0;

    perPage: number = 2;

    fields : Object[] = [
      {
        key: 'picture',
        label: this.getTranslation('productTable.picture'),
      },
      {
        key: 'name',
        label: this.getTranslation('productTable.name'),
      },
      {
        key: 'category',
        label: this.getTranslation('productTable.category'),
      },
      {
        key: 'price',
        label: this.getTranslation('productTable.price'),
      },
      {
        key: 'isAlcoholic',
        label: this.getTranslation('productTable.alcoholic'),
      },
      {
        key: 'negative',
        label: this.getTranslation('productTable.negative'),
      },
    ];

    beforeMount() {
      if (this.productsProp === undefined) {
        this.productList = FakeProducts.fetchProducts();
      } else {
        this.productList = this.productsProp;
      }

      this.totalRows = this.productList.length;
    }

    /**
      Method that grabs extra transactions when 2 pages or less are left
    */
    pageClicked(page: number) : void {
      if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.previousPage = page;
    }

    filterFinished(products: Product[], length: number): void {
      this.totalRows = length;
    }
}
</script>

<style lang="scss" scoped>
  .thumbnail {
    max-width: 4rem;
    max-height: 2.25rem;
  }

  .pageination {
    color: gray;
    text-transform: uppercase;
  }
</style>
