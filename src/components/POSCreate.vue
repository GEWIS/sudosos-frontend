<template>
  <b-container fluid="lg">
    <h1 class="mb-2">
      {{ posID === undefined ?
      $t('c_POSCreate.Create Point of Sale')
      : $t('c_POSCreate.Edit Point of Sale') }}
    </h1>
    <hr>
    <b-row class="mx-0">
      <b-col md="3" sm="12" class="mb-4 mb-md-0">
        <h5>{{ $t('c_POSCreate.General') }}</h5>
        <div class="pl-1">
          <b-form-group
            id="name-label"
            label-cols="12"
            :label="$t('c_POSCreate.Title')"
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
          <b-form-group
            class="thicc-label"
            label-cols="12"
            :label="$t('c_containerEditModal.owner')"
            label-align="left"
            label-for="name">
            <b-form-select v-model="posOwnerId" :options="organsList"></b-form-select>
          </b-form-group>

          <b-form-group>
            <b-form-checkbox
              id="authentication"
              v-model="useAuthentication"
              name="authentication"
              :value="true"
              :unchecked-value="false"
            >
              Use Authentication
            </b-form-checkbox>
          </b-form-group>
          <b>{{ $t('c_POSCreate.Selected containers')}}</b>
          <ul v-if="requestContainers.length > 0"  class="pl-4">
            <li
              v-for="container in requestContainers"
              v-bind:key="container.id"
            >
              <p class="text-truncate m-0">{{ container.name }}</p>
            </li>
          </ul>
          <span class="d-block" v-else>
            {{ $t('c_POSCreate.No containers') }}
          </span>
        </div>
        <b-button
          class="mt-2"
          variant="success"
          @click="requestPOS"
          :disabled="!nameState">
          {{ posID === undefined ? $t('c_POSCreate.Create') : $t('c_POSCreate.Edit') }}
        </b-button>
      </b-col>

      <b-col md="9" sm="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('c_POSCreate.Containers') }}</p>
          <b-button class="my-2 text-truncate" variant="success" v-on:click="addContainer">
            <font-awesome-icon icon="plus" size="sm" class="mr-2" />
            {{ $t('c_POSCreate.add container') }}
          </b-button>
        </div>
        <h6
          v-if="publicContainers.records && publicContainers.records.length > 0"
          class="ml-3">
          {{ $t('c_POSCreate.Public containers') }}
        </h6>
        <ContainerComponent
          v-for="container in publicContainers.records"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="container.owner.id === userState.self.id"
          :already-selected="checkIfSelected(container.id)"
          @toggled="containerToggled"
          v-model="editContainer"
          v-on:productDetails="showProductDetails"
        />

        <hr v-if="publicContainers.records &&
                  publicContainers.records.length > 0 &&
                  containers.records &&
                  containers.records.length > 0"
        >

        <h6 v-if="containers.records && containers.records.length > 0" class="ml-3">
          {{ $t('c_POSCreate.Own containers') }}
        </h6>
        <ContainerComponent
          v-for="container in containers.records"
          v-bind:key="container.id"
          :container="container"
          :enabled="true"
          :editable="container.owner.id === userState.self.id"
          :already-selected="checkIfSelected(container.id)"
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
      @updatedContainer="getContainerData"
      @addedContainer="getContainerData"
    />

    <ProductEditModal
      :editProduct="editProduct"
      :container="activeContainer"
    />

    <ConfirmationModal
      :reason="$t('c_POSCreate.are you sure').toString()"
      :title="$t('c_POSCreate.confirm').toString()"
      v-on:modalConfirmed="confirmContainerDelete"
    />

    <ProductInfoModal
      :product="infoProduct"
      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
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
import { getPointOfSale, patchPointOfSale, postPointOfSale } from '@/api/pointOfSale';
import { PointOfSale } from '@/entities/PointOfSale';

@Component({
  components: {
    ContainerComponent,
    ContainerEditModal,
    ProductEditModal,
    ConfirmationModal,
    ProductInfoModal,
  },
})
export default class POSCreate extends Vue {
  @Prop() posID?: number;

  private userState = getModule(UserModule);

  name: string | null = null;

  useAuthentication: boolean = true;

  editPOS: PointOfSale = {} as PointOfSale;

  posOwnerId: number = null;

  requestContainers: Container[] = [];

  containers: ContainerList = {} as ContainerList;

  publicContainers: ContainerList = {} as ContainerList;

  editContainer: Container = {} as Container;

  editProduct: Product = {} as Product;

  activeContainer: Container = {} as Container;

  infoProduct: Product = {} as Product;

  organsList: {value: number, text: string}[] = [];

  async beforeMount() {
    await this.userState.fetchUser();
    this.organsList = this.userState.organsList;
    this.posOwnerId = this.userState.organsList[0].value;

    if (this.posID) {
      await getPointOfSale(this.posID).then((data: PointOfSale) => {
        this.name = data.name;
        this.requestContainers = data.containers as Container[];
        this.editPOS = data;
      });
    }

    await this.getContainerData();
  }

  /**
   * Grabs all the container data
   */
  async getContainerData() {
    await getUserContainers(this.userState.self.id, 999).then((data: ContainerList) => {
      this.containers = data;
    });

    await getPublicContainers(999).then((data: ContainerList) => {
      // TODO: Change to correct owner ID
      const userId = this.userState.self.id;
      data.records = data.records.filter((container: Container) => container.owner.id !== userId);
      this.publicContainers = data;
    });
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
   * Check if a container (by ID) is already selected (needed when updating a POS)
   *
   * @param {number} id ID of the container you want to check
   * @returns {boolean} true if the container has already been selected
   */
  checkIfSelected(id: number) {
    const selectedIDs = this.requestContainers.map((c) => Number(c.id));

    return selectedIDs.indexOf(id) >= 0;
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

  async requestPOS() {
    if (!this.nameState) {
      this.name = '';
    }

    if (this.nameState) {
      const { organsList } = this.userState;

      const pointOfSale = {
        id: 0,
        ownerId: this.posOwnerId,
        name: this.name,
        containers: this.requestContainers.map((c) => c.id),
        useAuthentication: this.useAuthentication,
      };

      // TODO: Redirect afterwards??
      if (this.posID === undefined) {
        delete pointOfSale.id;
        await postPointOfSale(pointOfSale);
        await this.$router.push({ name: 'pointOfSale' });
      } else {
        delete pointOfSale.ownerId;
        pointOfSale.id = Number(this.posID);

        await patchPointOfSale(this.posID, pointOfSale);
      }
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
      return this.$t('c_POSCreate.name invalid').toString();
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

.thicc-label {
  font-weight: 700;
}

#name-label {
  font-weight: 700;
}
</style>
