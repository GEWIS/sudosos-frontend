<template>
  <div>

    <b-table
      :fields="fields"
      :items="vatGroupList"
      stacked="sm"
      small
      borderless
      thead-class="table-header"
      :filter="nameFilter"
      :filter-included-fields="['name']"
      :per-page="perPage"
      :current-page="currentPage"
      v-on:row-clicked="editVatGroup"
      v-sortable="sortableOptions"
      tbody-tr-class="product-row"
    >
      <!-- If the table data is still loading display something nice -->
      <template #table-busy>
        <div class="text-center text-muted mt-5 mb-3">
          <b-spinner class="align-middle"></b-spinner>
        </div>
      </template>

      <!-- Templates for each row cell -->
      <template v-slot:cell(image)="data">
        <img class="thumbnail" :src="`/static/products/${data.value}`" :alt="data.value">
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
        {{ $t('c_productTable.Page') }}:
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
import { Component, Prop, Watch } from 'vue-property-decorator';
import Sortable from 'sortablejs';
import eventBus from '@/eventbus';
import Formatters from '@/mixins/Formatters';
import { Product } from '@/entities/Product';
import { VatGroup } from '@/entities/VatGroup';

@Component({
  directives: {
    sortable: {
      bind(el: any, binding: any, vnode: any) {
        const table = el;
        // eslint-disable-next-line max-len
        // table._sortable = Sortable.create(table.querySelector('tbody'), { ...binding.value, vnode });
      },
    },
  },
})
export default class VatGroupTable extends Formatters {
  @Prop() vatGroupsProp?: VatGroup[];

  @Prop() enabled: Boolean | undefined;

  @Prop({ default: true }) editable!: boolean;

  nameFilter: string = '';

  vatGroupList: VatGroup[] = [];

  currentPage: number = 1;

  previousPage: number = 0;

  totalRows: number = 0;

  perPage: number = 0;

  sortableOptions: Object = {
    chosenClass: 'is-selected',
    onEnd: this.dragEnded,
  };

  fields : Object[] = [
    {
      key: 'name',
      label: this.getTranslation('c_vatGroupTable.name'),
      locale_key: 'name',
    },
    {
      key: 'deleted',
      label: this.getTranslation('c_vatGroupTable.deleted'),
      locale_key: 'category',
    },
    {
      key: 'hidden',
      label: this.getTranslation('c_vatGroupTable.hidden'),
      locale_key: 'category',
    },
    {
      key: 'percentage',
      label: this.getTranslation('c_vatGroupTable.percentage'),
      locale_key: 'percentage',
    },
  ];

  beforeMount() {
    this.vatGroupList = this.vatGroupsProp;
    this.totalRows = this.vatGroupList?.length;
    // If the locale is changed make sure the labels are also correctly updated for the b-table
    eventBus.$on('localeUpdated', () => {
      this.fields = this.updateTranslations(this.fields, 'c_productTable');
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
  // eslint-disable-next-line class-methods-use-this
  dragEnded(evt: any): void {
    const indexOld: number = evt.oldIndex;
    const indexNew: number = evt.newIndex;

    // TODO: Make sure index is actually updated somewhere
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

  @Watch('productsProp')
  onProductPropChange() {
    this.vatGroupsProp = this.vatGroupsProp as VatGroup[];
    this.totalRows = this.vatGroupsProp?.length;
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
