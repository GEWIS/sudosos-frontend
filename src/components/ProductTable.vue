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

  <b-form-group
    id="page-amount-group"
    :label="$t('productTable.Products per page')"
    label-for="page-amount"
    label-cols-md="2"
    label-cols="12"
  >
    <b-form-input id="page-amount"
                  v-model="perPage"
                  type="number"
                  min="1"
                  step="1"
                  trim>
    </b-form-input>
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

    <!-- Template slots for header, makes headers translateable -->
    <template v-slot:head(picture)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <template v-slot:head(name)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <template v-slot:head(category)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <template v-slot:head(price)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <template v-slot:head(isAlcoholic)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <template v-slot:head(negative)="data">
      {{ $t(`productTable.${data.label}`) }}
    </template>

    <!-- Templates for each row cell -->
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
import Sortable from 'sortablejs';
import Formatters from '@/mixins/Formatters';
import { Product } from '@/entities/Product';
import FakeProducts from '@/assets/products';

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
    @Prop() private productsProp!: Product[];

    @Prop() enabled: Boolean | undefined;

    @Prop({ default: true }) editable!: boolean;

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
        label: 'picture',
      },
      {
        key: 'name',
        label: 'name',
      },
      {
        key: 'category',
        label: 'category',
      },
      {
        key: 'price',
        label: 'price',
      },
      {
        key: 'isAlcoholic',
        label: 'alcoholic',
      },
      {
        key: 'negative',
        label: 'negative',
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
