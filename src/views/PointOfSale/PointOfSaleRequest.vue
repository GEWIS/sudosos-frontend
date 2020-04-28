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
              <li v-for="storage in requestedPOS.storages" v-bind:key="storage.id">
                  {{ storage.name }}
              </li>
          </ul>
        </div>
        <h5>{{ $t('posRequest.Management') }}</h5>
        <div class="pl-1">
          <b>{{ $t('posRequest.Owner') }}</b>
          <b-form-select class="my-2" v-model="requestedPOS.ownerId" :options="availableOrgans">
          </b-form-select>
          <ul v-if="availableOrgans.find((organ) => organ.value === requestedPOS.ownerId)"
              class="pl-4">
            <li v-for="member in
              availableOrgans.find((organ) => organ.value === requestedPOS.ownerId).members"
                v-bind:key="member">
              {{ member }}
            </li>
          </ul>
        </div>
        <b-button class="mt-2" variant="success" @click="requestPOS"
            :disabled="requestButtonDisabled">
            {{ $t('posRequest.Request')}}
        </b-button>
      </b-col>

      <b-col md="9" sm="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
          <b-button class="my-2" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" />
            {{ $t('posRequest.add container') }}
          </b-button>
        </div>
        <Container v-for="storage in standardContainers"
                   v-bind:key="storage.id"
                   :container="storage"
                   :enabled="true"
                   :editable="false"
                   @toggled="containerToggled"
                   v-model="editContainer"
        />

        <Container v-for="storage in addedContainers"
                   v-bind:key="storage.id"
                   :container="storage"
                   :enabled="true"
                   :editable="true"
                   @toggled="containerToggled"
                   v-model="editContainer"
                   v-on:addProduct="prepAddingProduct"
                   v-on:editProduct="prepEdittingProduct"
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
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { Storage } from '@/entities/Storage';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';
import PointsOfSale from '@/assets/pointsOfSale';
import EditContainerModal from '@/components/EditContainerModal.vue';
import EditProductModal from '@/components/EditProductModal.vue';
import { Product } from '@/entities/Product';

  @Component({
    components: { Container, EditContainerModal, EditProductModal },
  })

export default class PointOfSaleRequest extends Vue {
    requestedPOS: PointOfSale = {
      name: '',
      id: '',
      ownerId: '',
      status: POSStatus.OPEN,
      storages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    standardContainers: Storage[] = [];

    addedContainers: Storage[] = [];

    availableOrgans: Object = [];

    editContainer: Storage = {} as Storage;

    editProduct: Product = {} as Product;

    addContainerID: string = '';

    beforeMount() {
      this.standardContainers = PointsOfSale.getAvailableContainers();
      this.availableOrgans = PointsOfSale.getAvailableOrgans();
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
      this.addedContainers.push(storage);
    }

    /*
    Method for editting storage container, once finished it's data will be updated everywhere
     */
    editStorage(storage: Storage): void {
      let i = this.addedContainers.findIndex(s => s.id === storage.id);

      if (i > 0) {
        this.addedContainers[i] = storage;
      }

      i = this.requestedPOS.storages.findIndex(s => s.id === storage.id);

      if (i > 0) {
        this.requestedPOS.storages[i] = storage;
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
    prepEdittingProduct(id: string, product: Product) {
      this.addContainerID = id;
      this.editProduct = product;
      this.$bvModal.show('edit-product');
    }

    addProduct(product: Product) : void {
      const i = this.addedContainers.findIndex(s => s.id === this.addContainerID);
      this.addedContainers[i].products.push(product);
    }

    editExistingProduct(product: Product) {
      const i = this.addedContainers.findIndex(s => s.id === this.addContainerID);
      const j = this.addedContainers[i].products.findIndex(p => p.id === product.id);
      this.addedContainers[i].products[j] = product;
    }

    // eslint-disable-next-line class-methods-use-this
    requestPOS() {
    // TODO: Verwerking data
    }

    containerToggled(containerData: any) {
      const containers = this.standardContainers.concat(this.addedContainers);

      const updatedContainer = containers.find(storage => storage.id === containerData.id);

      if (updatedContainer) {
        if (containerData.state) {
          this.requestedPOS.storages.push(updatedContainer);
        } else {
        // Using a filter to remove items from an object array
          this.requestedPOS.storages = this.requestedPOS.storages
            .filter(storage => storage.id !== updatedContainer.id);
        }
      }
    }

    get requestButtonDisabled() {
      return this.requestedPOS.name.length < 1 || this.requestedPOS.ownerId === '';
    }
}
</script>

<style lang="scss" scoped>
  .approve-reject-buttons{
    button {
      margin-right: 8px;
      min-width: 100px;
    }
  }
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
