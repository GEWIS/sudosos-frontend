<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">
      {{ $t('manageProducts.Manage all products and default containers') }}
    </h1>

    <b-row>
      <b-col cols="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('manageProducts.All products') }}</p>
          <b-button
            class="my-2 text-truncate"
            variant="success"
            v-on:click="prepAddingProduct({})"
          >
            <font-awesome-icon icon="plus" />
            {{ $t('manageProducts.Add product') }}
          </b-button>
        </div>
        <ProductTable
          :productsProp="products"
          :editable="true"
          :enabled="true"
          v-on:editProduct="prepEditStandardProduct"
          v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('manageProducts.Default containers') }}</p>
          <b-button class="my-2 text-truncate" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" />
            {{ $t('manageProducts.Add container') }}
          </b-button>
        </div>
        <ContainerComponent
          v-for="container in standardContainers"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="true"
          v-model="editContainer"
          v-on:addProduct="prepAddingProduct"
          v-on:editProduct="prepEditContainerProduct"
          v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <EditContainerModal
      :editContainer="editContainer"
    />

    <EditProductModal
      :editProduct="editProduct"
      :container="activeContainer"
    />

    <ConfirmationModal
      :reason="$t('manageProducts.Are you sure')"
      :title="$t('manageProducts.Confirm')"
      v-on:modalConfirmed="confirmContainerDelete"
    />

    <ProductInfoModal
      :product="infoProduct"
      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ContainerComponent from '@/components/ContainerComponent.vue';
import EditContainerModal from '@/components/EditContainerModal.vue';
import EditProductModal from '@/components/EditProductModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { Container } from '@/entities/Container';
import { Product } from '@/entities/Product';
import ProductTable from '@/components/ProductTable.vue';
import ProductsModule from '@/store/modules/products';
import ContainerModule from '@/store/modules/containers';


@Component({
  components: {
    ContainerComponent,
    EditContainerModal,
    EditProductModal,
    ConfirmationModal,
    ProductInfoModal,
    ProductTable,
  },
})

export default class ManageProducts extends Vue {
  private productState = getModule(ProductsModule);

  private containerState = getModule(ContainerModule);

  standardContainers: Container[] = [];

  editContainer: Container = {} as Container;

  editProduct: Product = {} as Product;

  infoProduct: Product = {} as Product;

  products: Product[] = [];

  activeContainer: Container = {} as Container;

  beforeMount() {
    this.containerState.fetchContainers();
    this.containerState.fetchPublicContainers();
    this.productState.fetchProducts();
    this.products = this.productState.userProducts;
    this.standardContainers = this.containerState.containers;
  }

  /**
   * Method for adding a new container, makes sure editContainer is an empty Container object
   */
  addContainer(): void {
    this.editContainer = {} as Container;
    this.$bvModal.show('edit-container');
  }

  /**
   * Method for preparing adding a product
   *
   * @param container: The container that a product is being added to
   */
  prepAddingProduct(container: Container) : void {
    this.activeContainer = container;
    this.editProduct = {} as Product;
    this.$bvModal.show('edit-product');
  }

  /**
   * Method for preparing editting an product
   */
  prepEditContainerProduct(container: Container, product: Product): void {
    this.activeContainer = container;
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  prepEditStandardProduct(product: Product): void {
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  /**
   * Once deletion of container is confirmed it should be removed from
   * the edited containers as well as the containers that were selected
   * for the requestedContainers
   */
  confirmContainerDelete(): void {
    this.containerState.removeContainer(this.editContainer);
  }

  /**
   * Method for showing product details
   *
   * @param product: The product that needs to be shown
   */
  showProductDetails(product: Product): void {
    this.infoProduct = product;
    this.$nextTick(() => {
      this.$bvModal.show('product-info-modal');
    });
  }
}
</script>

<style lang="scss" scoped>
//@import '~bootstrap/scss/bootstrap';
@import './src/styles/Card.scss';

.row {
  padding: 0 15px 0 15px;
}

.containers-container{
  border: 2px solid $gewis-grey-light;
  margin-bottom: 2rem;

  .containers-header {
    color: $gewis-red;
    font-size: 1em;
    font-weight: 600;
    text-transform: uppercase;
    margin: 1em 1em 1em 0;
  }
}
</style>
