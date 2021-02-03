<template>
  <b-container fluid="lg">
    <b-row>
      <b-col lg="8" cols="12">
        <h1 class="mb-2 mb-sm-2 mb-lg-2 text-truncate">
          {{ $t('posApprove.Request:') }} {{ requestedPOS.name }}
        </h1>
      </b-col>
      <b-col class="approve-reject-buttons" lg="4" cols="12">
        <b-button variant="success">
          <font-awesome-icon icon="check"></font-awesome-icon>
          {{ $t('posApprove.Approve')}}
        </b-button>
        <b-button variant="danger">
          <font-awesome-icon icon="times"></font-awesome-icon>
          {{ $t('posApprove.Reject')}}
        </b-button>
      </b-col>
    </b-row>
    <hr>
    <b-row class="m-0">
      <b-col md="3" sm="12">
        <h3>{{ $t('posApprove.General') }}</h3>
        <b>{{ $t('posApprove.Title') }}</b>
        <p>{{ requestedPOS.name }}</p>
        <h3>{{ $t('posApprove.Management') }}</h3>
        <b>{{ $t('posApprove.Owner') }}</b>
        <p>{{ ownerData.organName }}</p>
        <b>{{ $t('posApprove.Managers') }}</b>
        <ul>
          <li v-for="member in ownerData.members" v-bind:key="member">
            {{ member }}
          </li>
        </ul>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posApprove.Containers') }}</p>
        <Container v-for="container in requestedPOS.containers"
                   v-bind:key="container.id"
                   :container="container"
                   :enabled="false"
                   v-on:productDetails="showProductDetails"
        />
      </b-col>
    </b-row>


    <ProductInfoModal :product="infoProduct"
                      v-if="Object.keys(infoProduct).length > 0"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Container from '@/components/ContainerComponent.vue';
import { PointOfSale } from '@/entities/PointOfSale';
import { Product } from '@/entities/Product';
import ProductInfoModal from '@/components/ProductInfoModal.vue';
import { pointOfSaleStore } from '@/store';

  @Component({
    components: { Container, ProductInfoModal },
  })

export default class PointOfSaleApprove extends Vue {
    @Prop() id!: number;

    requestedPOS: PointOfSale = {} as PointOfSale;

    ownerData: Object = {};

    infoProduct: Product = {} as Product;

    beforeMount() {
      const pos = pointOfSaleStore.pointsOfSale;
      const index = pos.findIndex(ps => ps.id === this.id);
      this.requestedPOS = pos[index];
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
</style>
