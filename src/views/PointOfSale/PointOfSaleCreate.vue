<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-2 mb-lg-2">
      {{ $t('posRequest.Create Point of Sale') }}
    </h1>
    <hr>
    <b-row class="mx-0">
      <b-col md="3" sm="12" class="mb-4 mb-md-0">
        <h5>{{ $t('posRequest.General') }}</h5>
        <div class="pl-1">
          <b-form-group
            id="name-label"
            label-cols="12"
            :label="$t('posRequest.Title')"
            label-align="left"
            label-for="name"
            :state="nameState"
            :invalid-feedback="invalidName"
          >
            <b-form-input
              id="name"
              name="name"
              type="text"
              v-model="name"
              :state="nameState"
            />
          </b-form-group>

          <b>{{ $t('posRequest.Selected containers')}}</b>
          <ul v-if="requestContainers.length > 0"  class="pl-4">
            <li
              v-for="container in requestContainers"
              v-bind:key="container.id"
            >
              <p class="text-truncate m-0">{{ container.name }}</p>
            </li>
          </ul>
          <span class="d-block" v-else>
            {{ $t('posRequest.No containers')}}
          </span>
        </div>
        <b-button
          class="mt-2"
          variant="success"
          @click="requestPOS"
          :disabled="!nameState">
          {{ $t('posRequest.Create')}}
        </b-button>
      </b-col>

      <b-col md="9" sm="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
          <b-button class="my-2 text-truncate" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" size="sm" class="mr-2" />
            {{ $t('posRequest.add container') }}
          </b-button>
        </div>
        <h6 v-if="publicContainers.records.length > 0" class="ml-3">Public containers</h6>
        <ContainerComponent
          v-for="container in publicContainers.records"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="container.owner.id === userState.user.id"
          @toggled="containerToggled"
          v-model="editContainer"
          v-on:productDetails="showProductDetails"
        />

        <hr v-if="publicContainers.records.length > 0">
        <h6 v-if="containers.records.length > 0" class="ml-3">Own containers</h6>

        <ContainerComponent
          v-for="container in containers.records"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="container.owner.id === userState.user.id"
          @toggled="containerToggled"
          v-model="editContainer"
          v-on:addProduct="prepAddingProduct"
          v-on:editProduct="prepEdittingProduct"
          v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <ContainerEditModal
      :editContainer="editContainer"
    />

    <ProductEditModal
      :editProduct="editProduct"
      :container="activeContainer"
    />

    <ConfirmationModal
      :reason="$t('posRequest.are you sure').toString()"
      :title="$t('posRequest.confirm').toString()"
      v-on:modalConfirmed="confirmContainerDelete"
    />

    <ProductInfoModal
      :product="infoProduct"
      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ContainerComponent from '@/components/ContainerComponent.vue';
import ContainerEditModal from '@/components/ContainerEditModal.vue';
import ProductEditModal from '@/components/ProductEditModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { Container, ContainerList } from '@/entities/Container';
import { Product } from '@/entities/Product';
import UserModule from '@/store/modules/user';

import { getPublicContainers, getUserContainers } from '@/api/containers';
import PointOfSaleModule from '@/store/modules/pointsofsale';

@Component({
  components: {
    ContainerComponent,
    ContainerEditModal,
    ProductEditModal,
    ConfirmationModal,
    ProductInfoModal,
  },
})
export default class PointOfSaleRequest extends Vue {
  private userState = getModule(UserModule);

  private pointOfSaleState = getModule(PointOfSaleModule);

  name: string | null = null;

  useAuthentication: boolean = false;

  startDate: string | null = null;

  endDate: string | null = null;

  requestContainers: Container[] = [];

  containers: ContainerList = {} as ContainerList;

  publicContainers: ContainerList = {} as ContainerList;

  editContainer: Container = {} as Container;

  editProduct: Product = {} as Product;

  activeContainer: Container = {} as Container;

  infoProduct: Product = {} as Product;

  async beforeMount() {
    this.userState.fetchUser();

    this.containers = await getUserContainers(this.userState.user.id, 999);
    this.publicContainers = await getPublicContainers(999);
  }

  @Watch('publicContainers')
  onTransactionsChanged() {
    const userId = this.userState.user.id;
    this.publicContainers.records = this.publicContainers.records.filter(
      (container) => container.owner.id !== userId,
    );
  }

  /**
   * Method that either deletes or adds a container to the requestedContainers
   *
   * @param data: object that contains the container that needs to be added or removed and the
   * state of the checkbox
   */
  containerToggled(data: { container: Container, state: boolean }) {
    if (data.state) {
      this.requestContainers.push(data.container);
    } else {
      const index = this.requestContainers.findIndex(
        (cntr: Container) => cntr.id === data.container.id,
      );
      this.requestContainers.splice(index, 1);
    }
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
   * Method for preparing editing an product
   *
   * @param container: The container in which a product is being edited
   * @param product: The product which is being edited in the container
   */
  prepEdittingProduct(container: Container, product: Product): void {
    this.activeContainer = container;
    this.editProduct = product;
    this.$bvModal.show('edit-product');
  }

  /**
   * Once deletion of container is confirmed it should be removed from
   * the edited containers as well as the containers that were selected
   * for the requestedContainers
  */
  confirmContainerDelete(): void {
    const index = this.requestContainers.findIndex((cntnr) => cntnr.id === this.editContainer.id);
    if (index >= 0) {
      this.requestContainers.splice(index, 1);
    }
    // this.containerState.removeContainer(this.editContainer);
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

  requestPOS() {
    if (!this.nameState) {
      this.name = '';
    }

    if (this.nameState) {
      const pointOfSale = {
        ownerId: this.userState.user.id,
        name: this.name,
        containers: this.requestContainers.map((c) => c.id),
      };

      this.pointOfSaleState.postPointOfSale(pointOfSale);
    }
  }

  /**
   * Checks if the name is correctly set, if initialized it won't display an
   * error because the name is still null
   *
   * @return {null | boolean}
   */
  get nameState() {
    return this.name === null ? null : this.name.length > 0;
  }

  get invalidName() {
    if (!this.nameState) {
      return this.$t('posRequest.name invalid').toString();
    }

    return '';
  }

  get startDateState() {
    if (this.startDate === null) {
      return null;
    }

    if (this.endDate !== null && this.endDate.length > 0) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);

      return end > start;
    }

    return true;
  }

  get invalidStartDate() {
    if (!this.startDateState) {
      return this.$t('posRequest.Start invalid').toString();
    }

    return '';
  }

  get endDateState() {
    if (this.endDate === null) {
      return null;
    }

    const end = new Date(this.endDate);
    const now = new Date();

    return end > now;
  }

  get invalidEndDate() {
    if (!this.endDateState) {
      return this.$t('posRequest.End invalid').toString();
    }

    return '';
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

#name-label {
  font-weight: 700;
}
</style>
