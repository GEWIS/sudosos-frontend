<template>
  <b-container fluid="lg">
    <b-row>
      <b-col lg="10" cols="12">
        <h1 class="mb-2 mb-sm-2 mb-lg-2 text-truncate">
          {{ $t('posInfo.POS') }}: {{ requestedPOS.name }}
        </h1>
      </b-col>
      <b-col class="approve-reject-buttons" lg="2" cols="12">
        <b-button variant="danger" @click="$router.push({ name: 'pointOfSale' })">
          <font-awesome-icon icon="times"></font-awesome-icon>
          {{ $t('posInfo.Close')}}
        </b-button>
      </b-col>
    </b-row>
    <hr>
    <b-row class="m-0">
      <b-col md="3" sm="12">
        <h3>{{ $t('posInfo.General') }}</h3>
        <b>{{ $t('posInfo.Title') }}</b>
        <p>{{ requestedPOS.name }}</p>
        <h3>{{ $t('posInfo.Management') }}</h3>
        <b>{{ $t('posInfo.Owner') }}</b>
        <p>{{ ownerData.organName }}</p>
        <b>{{ $t('posInfo.Managers') }}</b>
        <ul>
          <li v-for="member in ownerData.members" v-bind:key="member">
            {{ member }}
          </li>
        </ul>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posInfo.Containers') }}</p>
        <Container v-for="storage in requestedPOS.storages"
                   v-bind:key="storage.id"
                   :container="storage"
                   :enabled="false"
                   v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>

    <TransactionsTable class="mt-4 mt-md-5"
                       :selfBought="false"
                       :putInByYou="false"
                       :putInForYou="false"
                       :hideHandled="false"
    />

    <ProductInfoModal :product="infoProduct"
                      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import Container from '@/components/ContainerComponent.vue';
import TransactionsTable from '@/components/TransactionsTable.vue';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { PointOfSale } from '@/entities/PointOfSale';
import { Product } from '@/entities/Product';
import { pointOfSaleStore } from '@/store';

  @Component({
    components: {
      Container,
      ProductInfoModal,
      TransactionsTable,
    },
  })

export default class PointOfSaleInfo extends Formatters {
    @Prop() id!: number;

    requestedPOS: PointOfSale = {} as PointOfSale;

    ownerData: Object = {};

    infoProduct: Product = {} as Product;

    beforeMount() {
      const pos = pointOfSaleStore.pointsOfSale;
      const index = pos.findIndex(ps => ps.id === this.id);
      this.requestedPOS = pos[index];
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

  @include media-breakpoint-down(xs) {
    .icon {
      margin: 0;
    }
  }
</style>
