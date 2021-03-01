<template>
  <div class="mb-2">
    <div class="container-head px-3 d-flex" v-on:click="collapseContainer">

      <!-- Select the container to enable it in the POS -->
      <b-input-group class="my-auto">
        <b-form-checkbox
          :id="'checkbox_' + container.id"
          v-model="selected"
          :disabled="!enabled"
          @change="checkBoxChanged"
          v-on:click.stop=""
        />
        <span>{{ container.name }}</span>
      </b-input-group>

      <!--  Container edit button    -->
      <span
        class="ml-3 mr-2 my-auto"
        v-show="canEdit && enabled && editable"
        v-on:click.stop=""
        v-on:click="$emit('input', container)"
        v-b-modal.edit-container>
            <font-awesome-icon icon="pen-alt" />
      </span>

      <!--   Container delete button   -->
      <span
        class="ml-2 mr-3 my-auto"
        v-show="canEdit && enabled && editable"
        v-on:click.stop=""
        v-on:click="$emit('input', container)"
        v-b-modal.confirmation>
            <font-awesome-icon icon="trash" />
      </span>

      <!--   Icons to either collapse or uncollapse
      container and switch between product views   -->
      <div class="d-inline ml-2 w-100 my-auto">
        <font-awesome-icon
          pull="right"
          icon="angle-down"
          v-show="!isOpen"
          class="mr-3 mt-1"
          size="lg"
        />
        <font-awesome-icon
          pull="right"
          icon="angle-up"
          v-show="isOpen"
          class="mr-3 mt-1"
          size="lg"
        />
        <b-form-checkbox
          class="float-right mr-2"
          v-on:click.stop=""
          v-model="tableView"
          name="check-button"
          switch
        >
          {{ $t('containerComponent.Table view')}}
        </b-form-checkbox>
      </div>
    </div>

    <!-- Product overview from products that are currently active in container -->
    <b-collapse
      v-if="isOpen"
      v-model="isOpen"
      v-sortable="sortableOptions"
      :id="'container_' + container.id"
      class="mt-1 storage"
    >
      <!--  Card view for products   -->
      <b-row v-show="!tableView" class="mx-0">
        <b-col
          v-for="item in container.products"
          :key="item.id"
          class="text-center product-card px-2"
          cols="6" sm="4" md="3" lg="2"
          v-on:click="productDetails(item)"
        >
          <div class="product" :class="{'add': canEdit && enabled && editable}">
            <img :src="item.picture" :alt="item.name"/>
            <p class="w-100 px-1 product-name mb-0 text-truncate">{{ item.name }}</p>
          </div>
        </b-col>

        <!-- Add new product card -->
        <b-col
          v-if="canEdit && enabled && editable"
          class="text-center product-card product-card-add px-2"
          cols="6" sm="4" md="3" lg="2"
          v-on:click="$emit('addProduct', container.id)"
        >
          <div class="product add">
            <div><font-awesome-icon icon="plus" class="h-100" /></div>
            <p class="w-100 product-name mb-0">{{ $t('containerComponent.new')}}</p>
          </div>
        </b-col>
      </b-row>

      <!--   Table view for products   -->
      <b-row v-show="tableView">
        <b-col cols="12" class="containers-container">
          <div
            v-if="canEdit && enabled && editable"
            class="d-flex justify-content-between align-items-center">
            <b-button
              class="my-2 text-truncate"
              variant="success"
              v-on:click="$emit('addProduct', container.id)"
            >
              <font-awesome-icon icon="plus" />
              {{ $t('containerComponent.Add product') }}
            </b-button>
          </div>
          <ProductTable
            :productsProp="container.products"
            :editable="true"
            :enabled="true"
            v-on:editProduct="productDetails"
            v-on:productDetails="productDetails"
          />
        </b-col>
      </b-row>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Sortable from 'sortablejs';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import ProductTable from '@/components/ProductTable.vue';
import { Container } from '@/entities/Container';
import { Product } from '@/entities/Product';
import ContainerModule from '@/store/modules/containers';

@Component({
  directives: {
    sortable: {
      bind(el: any, binding: any, vnode: any) {
        const container = el;
        container._sortable = Sortable.create(container.querySelector('.row'), { ...binding.value, vnode });
      },
    },
  },
  components: {
    ProductTable,
  },
})
export default class ContainerComponent extends Vue {
  @Prop() containerID!: number;

  @Prop() enabled: Boolean | undefined;

  @Prop({ default: true }) editable!: boolean;

  container: Container = {} as Container;

  private userState = getModule(UserModule);

  private containerState = getModule(ContainerModule);

  isOpen: Boolean = false;

  selected: Boolean = false;

  tableView: Boolean = false;

  sortableOptions: Object = {
    chosenClass: 'is-selected',
    filter: '.product-card-add',
    onEnd: this.dragEnded,
  };

  beforeMount() {
    this.userState.fetchUser();
    this.containerState.fetchContainers();
    const { containers } = this.containerState;
    this.container = containers.find(cntr => cntr.id === this.containerID) as Container;
  }

  mounted() {
    this.selected = !this.enabled || false;
  }

  collapseContainer() {
    this.isOpen = !this.isOpen;

    this.$root.$emit('bv::toggle:collapse', `container_${this.container.id}`);
  }

  /**
   * Checks if person can edit this product, otherwise the details modal will be shown
   *
   * @param product Product that is being clicked
   */
  productDetails(product: Product) {
    if (this.canEdit && this.enabled && this.editable) {
      this.$emit('editProduct', this.container.id, product);
    } else {
      this.$emit('productDetails', product);
    }
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

    this.editable = this.editable;
  }

  /**
   * Check if the checkbox for toggling the storage on is checked
   *
   * @param event: click event
   */
  checkBoxChanged(event: any) {
    const containerId = this.container ? this.container.id : '0';
    this.$emit('toggled', { id: containerId, state: event });
  }

  /**
   * Check if current user has the rights to edit this storage container
   */
  get canEdit() {
    const { user } = this.userState;
    const owner = this.container.owner.id === user.id;
    const hasPermission = this.userState.hasPermission('container');

    return owner || hasPermission;
  }
}
</script>

<style scoped lang="scss">
.input-group {
  flex-wrap: nowrap;
  width: auto;
}

.container-head {
  background-color: $gewis-grey-light;
  cursor: pointer;
  height: 2.5rem;

  span {
    white-space: nowrap;
  }
}

.product-card {
  margin: 0.5rem 0;

  > div {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    justify-content: center;
  }

  .product {
    cursor: pointer;
    background-color: $gewis-grey-light;

    > img {
      width: auto;
      height: auto;
      max-height: 5rem;
      background-color: $gewis-grey-light;
      max-width: 100%;
    }

    > .product-name {
      background: $gewis-grey-accent;
      margin-top: auto;
    }
  }

  .product.add > div {
    height: 5rem;
    width: auto;
  }
}

.product-card:hover {
  > .product {
    background-color: $gewis-grey-accent;
    > .product-name {
      background-color: rgba(215, 215, 215, 1);
    }
  }
}

</style>
