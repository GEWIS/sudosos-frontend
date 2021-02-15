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
            <li v-for="container in requestedPOS.containers" v-bind:key="container.id">
              {{ container.name }}
            </li>
          </ul>
        </div>
        <h5>{{ $t('posRequest.Management') }}</h5>
        <div class="pl-1">
          <b>{{ $t('posRequest.Owner') }}</b>
          <b-form-select class="my-2" v-model="requestedPOS.owner.id" :options="availableOrgans">
          </b-form-select>
          <ul v-if="availableOrgans.find((organ) => organ.value === requestedPOS.owner.id)"
              class="pl-4">
            <li v-for="member in
              availableOrgans.find((organ) => organ.value === requestedPOS.ownerId).members"
                v-bind:key="member">
              {{ member }}
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
        <Container
          v-for="container in standardContainers"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="false"
          @toggled="containerToggled"
          v-model="editContainer"
          v-on:productDetails="showProductDetails"
        />

        <ContainerComponent
          v-for="container in addedContainers"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="true"
          @toggled="containerToggled"
          v-model="editContainer"
          v-on:addProduct="prepAddingProduct"
          v-on:editProduct="prepEdittingProduct"
          v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <EditContainerModal
      :editContainer="editContainer"
      v-on:storageAdded="addStorage"
      v-on:storageEdited="editStorage"
    />

    <EditProductModal
      :editProduct="editProduct"
      :container="addFromContainer"
      v-on:productAdded="addProduct"
      v-on:productEdited="editExistingProduct"
      v-on:productDeleted="deleteProduct"
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
import { Container } from '@/entities/Container';
import { PointOfSale } from '@/entities/PointOfSale';
import EditContainerModal from '@/components/EditContainerModal.vue';
import EditProductModal from '@/components/EditProductModal.vue';
import { Product } from '@/entities/Product';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import ContainerModule from '@/store/modules/containers';

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

  requestedPOS: PointOfSale = {} as PointOfSale;

  standardContainers: Container[] = [];

  addedContainers: Container[] = [];

  availableOrgans: Object = [];

  editContainer: Container = {} as Container;

  editProduct: Product = {} as Product;

  addFromContainer: boolean = false;

  addContainerID: number = 0;

  infoProduct: Product = {} as Product;

  beforeMount(): void {
    this.standardContainers = this.containerState.getPublicContainers;
  }

  /*
  Method for adding a new container, makes sure editContainer is an empty Container object
   */
  addContainer(): void {
    this.editContainer = {} as Container;
    this.$bvModal.show('edit-container');
  }

  /*
  Method for adding a container container
   */
  addStorage(container: Container): void {
    this.addedContainers.push(container);
  }

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

  /*
  Method for preparing adding a product
   */
  prepAddingProduct(id: number) : void {
    this.addContainerID = id;
    this.addFromContainer = id > 0;
    this.editProduct = {} as Product;
    this.$bvModal.show('edit-product');
  }

  /*
  Method for preparing editting an product
   */
  prepEdittingProduct(id: number, product: Product): void {
    this.addContainerID = id;
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  /*
  Method to add new products to the container container. If the container container was already
  added to the requestedPOS is will be updated there as well.
  */
  addProduct(product: Product) : void {
    const i = this.addedContainers.findIndex(s => s.id === this.addContainerID);
    this.addedContainers[i].products.push(product);
    this.editStorage(this.addedContainers[i]);
  }

  /*
  Method to edit a currently existing product and updating it's data. Once updated it will also be
  updated in the requestedPOS if it's container container was already in there.
  */
  editExistingProduct(product: Product): void {
    const i = this.addedContainers.findIndex(s => s.id === this.addContainerID);
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

  /*
  Method for deleting product from container
  */
  deleteProduct(product: Product): void {
    const i = this.addedContainers.findIndex(s => s.id === this.addContainerID);
    this.addedContainers[i].products = this.addedContainers[i].products.filter(
      p => p.id !== product.id,
    );
    this.editStorage(this.addedContainers[i]);
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

  // eslint-disable-next-line class-methods-use-this
  requestPOS() {
    // TODO: Verwerking data
  }

  /*
  Method that either deletes or add's selected containers to the requestedPOS
   */
  containerToggled(containerData: any) {
    const containers = this.standardContainers.concat(this.addedContainers);

    const updatedContainer = containers.find(container => container.id === containerData.id);

    if (updatedContainer) {
      if (containerData.state) {
        this.requestedPOS.containers.push(updatedContainer);
      } else {
        // Using a filter to remove items from an object array
        this.requestedPOS.containers = this.requestedPOS.containers
          .filter(container => container.id !== updatedContainer.id);
      }
    }
  }

  get requestButtonDisabled() {
    return this.requestedPOS.name.length < 1 || this.requestedPOS.owner.id === -1;
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

.modal {

}
</style>
