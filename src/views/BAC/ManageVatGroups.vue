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
            <font-awesome-icon icon="plus" size="sm" class="mr-2" />
            {{ $t('manageProducts.Add product') }}
          </b-button>
        </div>
        <ProductTable
          :productsProp="this.productState.products"
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
            <font-awesome-icon icon="plus" size="sm" class="mr-2" />
            {{ $t('manageProducts.Add container') }}
          </b-button>
        </div>
        <ContainerComponent
          v-for="container in containers"
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

    <ContainerEditModal
      :editContainer="editContainer"
    />

    <ProductEditModal
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
import ContainerComponent from '@/components/ContainerComponent.vue';
import ContainerEditModal from '@/components/ContainerEditModal.vue';
import ProductEditModal from '@/components/ProductEditModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import ProductTable from '@/components/ProductTable.vue';

@Component({
  components: {
    ContainerComponent,
    ContainerEditModal,
    ProductEditModal,
    ConfirmationModal,
    ProductInfoModal,
    ProductTable,
  },
})

export default class ManageProducts extends Vue {

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
