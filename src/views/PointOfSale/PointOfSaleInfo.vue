<template>
  <b-container fluid="lg">
    <b-row>
      <b-col lg="9" cols="12">
        <h1 class="mb-2 mb-sm-2 mb-lg-2 text-truncate">
          {{ $t('posInfo.POS') }}: {{ infoPOS.name }}
        </h1>
      </b-col>
      <b-col class="approve-reject-buttons" lg="3" cols="12">
        <div class="d-flex justify-content-end">
          <b-button
            variant="secondary"
            @click="$router.push({ name: 'pointOfSaleEdit', params: { id: infoPOS.id.toString() }})"
          >
            <font-awesome-icon icon="pen-alt"/>
            {{ $t('posInfo.Edit') }}
          </b-button>
          <b-button variant="primary" @click="$router.push({ name: 'pointOfSale' })">
            <font-awesome-icon icon="times"/>
            {{ $t('posInfo.Close') }}
          </b-button>
        </div>
      </b-col>
    </b-row>
    <hr>
    <b-row class="m-0">
      <b-col md="3" sm="12" class="pl-1">
        <h3>{{ $t('posInfo.General') }}</h3>
        <b>{{ $t('posInfo.Title') }}</b>
        <p>{{ infoPOS.name }}</p>
        <b>{{ $t('posInfo.Owner') }}</b>
        <p v-if="infoPOS.owner">{{ infoPOS.owner.name }}</p>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posInfo.Containers') }}</p>
        <ContainerComponent
          v-for="container in infoPOS.containers"
          :key="container.id"
          :container="container"
          :enabled="false"
          v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <TransactionsTable
      class="mt-4 mt-md-5"
      :selfBought="false"
      :putInByYou="false"
      :putInForYou="false"
      :hideHandled="false"
      :pointOfSale="id"
    />

    <ProductInfoModal
      :product="infoProduct"
      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import ContainerComponent from '@/components/ContainerComponent.vue';
import TransactionsTable from '@/components/TransactionsTable.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { PointOfSale } from '@/entities/PointOfSale';
import { Product } from '@/entities/Product';
import PointOfSaleModule from '@/store/modules/pointsofsale';
import { getPointOfSale, getPointOfSaleUpdate } from '@/api/pointOfSale';

@Component({
  components: {
    ContainerComponent,
    ProductInfoModal,
    TransactionsTable,
  },
})

export default class PointOfSaleInfo extends Formatters {
  @Prop() id!: number;

  infoProduct: Product = {} as Product;

  infoPOS: PointOfSale = {} as PointOfSale;

  async beforeMount() {
    if (this.$route.query.update) {
      this.infoPOS = await getPointOfSaleUpdate(this.id);
    } else {
      this.infoPOS = await getPointOfSale(this.id);
    }
  }

  /**
   * Method for showing product details
   *
   * @param product Product that will be shown
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
@import "~bootstrap/scss/bootstrap";
@import './src/styles/Card.scss';

.icon {
  color: $gewis-grey;
  margin: 0 1rem;
}

.approve-reject-buttons {
  margin-top: auto;
  margin-bottom: auto;
  text-align: right;

  button:first-of-type {
    margin-right: 8px;
  }

  button {
    min-width: 100px;
    margin-bottom: 8px;
  }
}

.containers-container {
  border: 2px solid $gewis-grey-light;

  .containers-header {
    color: $gewis-red;
    font-size: 1em;
    font-weight: 600;
    text-transform: uppercase;
    margin: 1em;
  }
}

@include media-breakpoint-down(xs) {
  .icon {
    margin: 0;
  }
}
</style>
