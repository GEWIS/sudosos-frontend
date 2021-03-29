<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-2 mb-lg-2">
      {{ $t('posRequest.Request Point of Sale') }}
    </h1>
    <hr>
    <b-row class="mx-0">
      <b-col md="3" sm="12" class="mb-4 mb-md-0">
        <h5>{{ $t('posRequest.General') }}</h5>
        <div class="pl-1">
          <b>{{ $t('posRequest.Title') }}</b>
          <b-form-input class="my-2" type="text" v-model="requestedPOS.name" />
          <b>{{ $t('posRequest.Selected containers')}}</b>
          <ul class="pl-4">
            <li
              v-for="container in requestedPOS.containers"
              v-bind:key="container.id"
            >
              <p class="text-truncate m-0">{{ container.name }}</p>
            </li>
          </ul>
        </div>
        <b-button
          class="mt-2"
          variant="success"
          @click="requestPOS"
          :disabled="requestButtonDisabled">
          {{ $t('posRequest.Request')}}
        </b-button>
      </b-col>

      <b-col md="9" sm="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
          <b-button class="my-2 text-truncate" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" />
            {{ $t('posRequest.add container') }}
          </b-button>
        </div>
        <ContainerComponent
          v-for="container in publicContainers"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="false"
          @toggled="containerToggled"
          v-on:productDetails="showProductDetails"
        />

        <ContainerComponent
          v-for="container in containers"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="true"
          @toggled="containerToggled"
          v-on:addProduct="prepAddingProduct"
          v-on:editProduct="prepEdittingProduct"
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
      :reason="$t('posRequest.are you sure')"
      :title="$t('posRequest.confirm')"
      v-on:modalConfirmed="confirmStorageDelete"
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
import ContainerModule from '@/store/modules/containers';
import { Container } from '@/entities/Container';
import { PointOfSale } from '@/entities/PointOfSale';
import { Product } from '@/entities/Product';

@Component({
  components: {
    ContainerComponent,
    EditContainerModal,
    EditProductModal,
    ConfirmationModal,
    ProductInfoModal,
  },
})
export default class PointOfSaleRequest extends Vue {
  private containerState = getModule(ContainerModule);

  requestedPOS: PointOfSale = {
    containers: [] as Container[],
  } as PointOfSale;

  containers: Container[] = [];

  publicContainers: Container[] = [];

  addedContainers: Container[] = [];

  editContainer: Container = {} as Container;

  editProduct: Product = {} as Product;

  activeContainer: Container = {} as Container;

  infoProduct: Product = {} as Product;

  beforeMount(): void {
    this.containerState.fetchContainers();
    this.containerState.fetchPublicContainers();
    this.containers = this.containerState.containers;
    this.publicContainers = this.containerState.publicContainers;
  }

  /**
   * Method that either deletes or adds a container to the requestedPOS
   *
   * @param data: object that contains the container that needs to be added or removed and the
   * state of the checkbox
   */
  containerToggled(data: { container: Container, state: boolean }) {
    if (data.state) {
      this.requestedPOS.containers.push(data.container);
    } else {
      const index = this.requestedPOS.containers.findIndex(cntr => cntr.id === data.container.id);
      this.requestedPOS.containers.splice(index, 1);
    }
  }

  /**
   * Method for adding a new container, makes sure editContainer is an empty Container object
   */
  addContainer(): void {
    this.editContainer = {} as Container;
    this.$bvModal.show('edit-container');
  }

  // TODO: Fix rest below :):)

  /*
  Method for editting container container, once finished it's data will be updated everywhere
   */
  editStorage(container: Container): void {
    let i = this.addedContainers.findIndex(s => s.id === container.id);

    if (i > 0) {
      this.addedContainers[i] = container;
    }

    i = this.requestedPOS.containers.findIndex(s => s.id === container.id);

    if (i > 0) {
      this.requestedPOS.containers[i] = container;
    }
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
   *
   * @param container: The container in which a product is being editted
   * @param product: The product which is being editted in the container
   */
  prepEdittingProduct(container: Container, product: Product): void {
    this.activeContainer = container;
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  /*
  Method to add new products to the container container. If the container container was already
  added to the requestedPOS is will be updated there as well.
  */
  addProduct(product: Product) : void {
    const i = this.addedContainers.findIndex(s => s.id === this.activeContainer.id);
    this.addedContainers[i].products.push(product);
    this.editStorage(this.addedContainers[i]);
  }

  /*
  Method to edit a currently existing product and updating it's data. Once updated it will also be
  updated in the requestedPOS if it's container container was already in there.
  */
  editExistingProduct(product: Product): void {
    const i = this.addedContainers.findIndex(s => s.id === this.activeContainer.id);
    const j = this.addedContainers[i].products.findIndex(p => p.id === product.id);
    this.addedContainers[i].products[j] = product;
    this.editStorage(this.addedContainers[i]);
  }

  /*
  Once deletion of container is confirmed it should be removed from the editted containers as
  well as the containers that were selected for the requestedPOS
  */
  confirmStorageDelete(): void {
    this.addedContainers = this.addedContainers.filter(s => s.id !== this.editContainer.id);
    this.requestedPOS.containers = this.requestedPOS.containers.filter(
      s => s.id !== this.editContainer.id,
    );
  }

  /**
   * Method for deleting product from container
   *
   * @param product: product that needs to be deleted
   */
  deleteProduct(product: Product): void {
    const i = this.addedContainers.findIndex(s => s.id === this.activeContainer.id);
    this.addedContainers[i].products = this.addedContainers[i].products.filter(
      p => p.id !== product.id,
    );
    this.editStorage(this.addedContainers[i]);
    this.$bvModal.hide('edit-product');
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

  // eslint-disable-next-line class-methods-use-this
  requestPOS() {
    // TODO: Verwerking data
  }

  // eslint-disable-next-line class-methods-use-this
  get requestButtonDisabled() {
    return false;
    // return this.requestedPOS.name.length < 1 || this.requestedPOS.owner.id === -1;
  }
}
</script>

<style lang="scss" scoped>
.containers-container{
  border: 2px solid $gewis-grey-light;

  .containers-header {
    color: $gewis-red;
    font-size: 1em;
    font-weight: 600;
    text-transform: uppercase;
    margin: 1em;
  }
}
</style>
