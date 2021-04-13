<template>
<div>
  <b-form-group
    id="name-filter-group"
    :label="$t('productTable.Filter by name')"
    label-for="name-filter"
    label-cols-md="2"
    label-cols="12"
  >
    <b-form-input
      id="name-filter"
      v-model="nameFilter"
      type="text"
      :placeholder="$t('productTable.Fill in a name')"
      trim
    />
  </b-form-group>

  <b-form-group
    id="page-amount-group"
    :label="$t('productTable.Products per page')"
    label-for="page-amount"
    label-cols-md="2"
    label-cols="12"
  >
    <b-form-input
      id="page-amount"
      v-model="perPage"
      type="number"
      inputmode="decimal"
      min="1"
      step="1"
      trim
    />
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
    v-on:row-clicked="productDetails"
    v-sortable="sortableOptions"
    tbody-tr-class="productRow"
  >

    <!-- Templates for each row cell -->
    <template v-slot:cell(picture)="data">
      <img class="thumbnail" :src="data.value" alt="">
    </template>

    <template v-slot:cell(name)="data">
      {{ data.value }}
    </template>

    <template v-slot:cell(category)="data">
      {{ setCapitalLetter(data.value.name) }}
    </template>

    <template v-slot:cell(price)="data">
      {{ data.value.toFormat() }}
    </template>

    <template v-slot:cell(alcoholPercentage)="data">
      {{ data.value }}%
    </template>
  </b-table>

  <div class="d-flex pageination py-3" v-if="totalRows > perPage">
    <p class="my-auto h-100">
      {{ $t('productTable.Page') }}:
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
    />
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Sortable from 'sortablejs';
import { getModule } from 'vuex-module-decorators';
import eventBus from '@/eventbus';
import Formatters from '@/mixins/Formatters';
import { Product } from '@/entities/Product';
import ProductsModule from '@/store/modules/products';


  @Component({
    directives: {
      sortable: {
        bind(el: any, binding: any, vnode: any) {
          const table = el;
          table._sortable = Sortable.create(table.querySelector('tbody'), { ...binding.value, vnode });
        },
      },
    },
  })
export default class ProductTable extends Formatters {
    @Prop() private productsProp?: Product[];

    @Prop() enabled: Boolean | undefined;

    @Prop({ default: true }) editable!: boolean;

    private productState = getModule(ProductsModule);

    nameFilter: string = '';

    productList: Product[] = [];

    currentPage: number = 1;

    previousPage: number = 0;

    totalRows: number = 0;

    perPage: number = 4;

    sortableOptions: Object = {
      chosenClass: 'is-selected',
      onEnd: this.dragEnded,
    };

    fields : Object[] = [
      {
        key: 'picture',
        label: this.getTranslation('productTable.picture'),
        locale_key: 'picture',
      },
      {
        key: 'name',
        label: this.getTranslation('productTable.name'),
        locale_key: 'name',
      },
      {
        key: 'category',
        label: this.getTranslation('productTable.category'),
        locale_key: 'category',
      },
      {
        key: 'price',
        label: this.getTranslation('productTable.price'),
        locale_key: 'price',
      },
      {
        key: 'alcoholPercentage',
        label: this.getTranslation('productTable.alcoholic'),
        locale_key: 'alcoholic',
      },
    ];

    beforeMount() {
      if (this.productsProp === undefined) {
        this.productState.fetchProducts();
        this.productList = this.productState.products as Product[];
      } else {
        this.productList = this.productsProp;
      }

      this.totalRows = this.productList.length;

      // If the locale is changed make sure the labels are also correctly updated for the b-table
      eventBus.$on('localeUpdated', () => {
        this.fields = this.updateTranslations(this.fields, 'productTable');
      });
    }

    /**
     * Method that grabs extra transactions when 2 pages or less are left
     *
     * @param page new page number
     */
    pageClicked(page: number) : void {
      if (this.previousPage < page && page >= (Math.ceil(this.totalRows / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.previousPage = page;
    }

    /**
     * Once dragging a products ends this method should also update index for sorting on the
     * back-end side
     *
     * @param evt Event with all the dragging information
     */
    dragEnded(evt: any): void {
      const indexOld: number = evt.oldIndex;
      const indexNew: number = evt.newIndex;

      // TODO: Make sure index is actually updated somewhere

      this.sortableOptions = this.sortableOptions;
    }

    /**
     * Checks if person can edit this product, otherwise the details modal will be shown
     *
     * @param product Product that is being clicked
     * @param index The index of the row currently being clicked
     * @param event Click event object
     */
    productDetails(product: Product, index: Number, event: object): void {
      if (this.enabled && this.editable) {
        this.$emit('editProduct', product);
      } else {
        this.$emit('productDetails', product);
      }
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
  .thumbnail {
    max-width: 4rem;
    max-height: 2.25rem;
  }

  .pageination {
    color: gray;
    text-transform: uppercase;
  }

  tr {
    cursor: pointer;
  }
</style>
