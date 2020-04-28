<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('manageProducts.Manage products') }}</h1>

    <b-row>
      <b-col cols="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('manageProducts.Containers') }}</p>
          <b-button class="my-2 text-truncate" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" />
            {{ $t('manageProducts.add container') }}
          </b-button>
        </div>
        <Container v-for="storage in standardContainers"
                   v-bind:key="storage.id"
                   :container="storage"
                   :enabled="true"
                   :editable="true"
                   v-model="editContainer"
                   v-on:addProduct="prepAddingProduct"
                   v-on:editProduct="prepEdittingProduct"
                   v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <EditContainerModal :editContainer="editContainer"
                        v-on:storageAdded="addStorage"
                        v-on:storageEdited="editStorage"
    />

    <EditProductModal :editProduct="editProduct"
                      v-on:productAdded="addProduct"
                      v-on:productEdited="editExistingProduct"
                      v-on:productDeleted="deleteProduct"
    />

    <ConfirmationModal :reason="$t('manageProducts.are you sure')"
                       :title="$t('manageProducts.confirm')"
                       v-on:modalConfirmed="confirmStorageDelete"
    />

    <ProductInfoModal :product="infoProduct"
                      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import EditContainerModal from '@/components/EditContainerModal.vue';
import EditProductModal from '@/components/EditProductModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { Storage } from '@/entities/Storage';
import { Product } from '@/entities/Product';
import PointsOfSale from '@/assets/pointsOfSale';

@Component({
  components: {
    Container, EditContainerModal, EditProductModal, ConfirmationModal, ProductInfoModal,
  },
})

export default class ManageProducts extends Vue {
  standardContainers: Storage[] = [];

  editContainer: Storage = {} as Storage;

  editProduct: Product = {} as Product;

  addContainerID: string = '';

  infoProduct: Product = {} as Product;

  beforeMount(): void {
    this.standardContainers = PointsOfSale.getAvailableContainers();
  }

  /*
Method for adding a new container, makes sure editContainer is an empty Storage object
 */
  addContainer(): void {
    this.editContainer = {} as Storage;
    this.$bvModal.show('edit-container');
  }

  /*
  Method for adding a storage container
   */
  addStorage(storage: Storage): void {
    this.standardContainers.push(storage);
  }

  /*
  Method for editting storage container, once finished it's data will be updated everywhere
   */
  editStorage(storage: Storage): void {
    const i = this.standardContainers.findIndex(s => s.id === storage.id);

    if (i > 0) {
      this.standardContainers[i] = storage;
    }
  }

  /*
  Method for preparing adding a product
   */
  prepAddingProduct(id: string) : void {
    this.addContainerID = id;
    this.editProduct = {} as Product;
    this.$bvModal.show('edit-product');
  }

  /*
  Method for preparing editting an product
   */
  prepEdittingProduct(id: string, product: Product): void {
    this.addContainerID = id;
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  /*
  Method to add new products to the storage container. If the storage container was already
  added to the requestedPOS is will be updated there as well.
  */
  addProduct(product: Product) : void {
    const i = this.standardContainers.findIndex(s => s.id === this.addContainerID);
    this.standardContainers[i].products.push(product);
    this.editStorage(this.standardContainers[i]);
  }

  /*
  Method to edit a currently existing product and updating it's data. Once updated it will also be
  updated in the requestedPOS if it's storage container was already in there.
  */
  editExistingProduct(product: Product): void {
    const i = this.standardContainers.findIndex(s => s.id === this.addContainerID);
    const j = this.standardContainers[i].products.findIndex(p => p.id === product.id);
    this.standardContainers[i].products[j] = product;
    this.editStorage(this.standardContainers[i]);
  }

  /*
  Once deletion of container is confirmed it should be removed from the editted containers as
  well as the containers that were selected for the requestedPOS
  */
  confirmStorageDelete(): void {
    this.standardContainers = this.standardContainers.filter(s => s.id !== this.editContainer.id);
  }

  /*
  Method for deleting product from container
  */
  deleteProduct(product: Product): void {
    const i = this.standardContainers.findIndex(s => s.id === this.addContainerID);
    this.standardContainers[i].products = this.standardContainers[i].products.filter(
      p => p.id !== product.id,
    );
    this.editStorage(this.standardContainers[i]);
    this.$bvModal.hide('edit-product');
  }

  /*
  Method for showing product details
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
