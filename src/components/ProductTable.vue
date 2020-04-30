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
    }
}
</script>

<style lang="scss" scoped>
  .thumbnail {
    max-width: 4rem;
    max-height: 2.25rem;
  }
</style>
