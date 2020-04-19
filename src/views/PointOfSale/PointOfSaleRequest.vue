<template>
  <b-container fluid="lg">
    <b-row>
      <b-col lg="8" cols="12">
        <h1 class="mb-2 mb-sm-2 mb-lg-2 text-truncate">
          {{ $t('posRequest.Request:') }} {{ requestedPOS.name }}
        </h1>
      </b-col>
      <b-col class="approve-reject-buttons" lg="4" cols="12">
        <b-button variant="success">
          <font-awesome-icon icon="check"></font-awesome-icon>
          {{ $t('posRequest.Approve')}}
        </b-button>
        <b-button variant="danger">
          <font-awesome-icon icon="times"></font-awesome-icon>
          {{ $t('posRequest.Reject')}}
        </b-button>
      </b-col>
    </b-row>
    <hr>
    <b-row class="m-0">
      <b-col md="3" sm="12">
        <h3>{{ $t('posRequest.General') }}</h3>
        <b>{{ $t('posRequest.Title') }}</b>
        <p>{{ requestedPOS.name }}</p>
        <h3>{{ $t('posRequest.Management') }}</h3>
        <b>{{ $t('posRequest.Owner') }}</b>
        <p>{{ ownerData.organName }}</p>
        <b>{{ $t('posRequest.Managers') }}</b>
        <ul>
          <li v-for="member in ownerData.members" v-bind:key="member">
            {{ member }}
          </li>
        </ul>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('Containers') }}</p>
        <Container v-for="storage in requestedPOS.storages" v-bind:key="storage.id"
          :container="storage" :enabled="false"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { Storage } from '@/entities/Storage';
import { Product } from '@/entities/Product';
import { PointOfSale } from '@/entities/PointOfSale';

  @Component({
    components: { Container },
  })

export default class PointOfSaleRequest extends Vue {
  // *************************************************
  //
  //               Begin test data
  //
  // *************************************************
  private beugel: Product = {
    id: '1',
    name: 'Grolsch beugel',
    ownerId: '1',
    price: 110,
    picture: 'https://www.supermarktaanbiedingen.com/public/images/product/2017/39/0-508102fls-grolsch-premium-pilsner-beugel-45cl.jpg',
    traySize: 20,
    category: 'drink',
    isAlcoholic: true,
    negative: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private tripel: Product = {
    id: '2',
    name: 'Grimbergen tripel (voor de sfeer)',
    ownerId: '1',
    price: 90,
    picture: 'https://deklokdranken.blob.core.windows.net/product-images/105120.jpg',
    traySize: 24,
    category: 'drink',
    isAlcoholic: true,
    negative: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private alcoholFree: Product = {
    id: '3',
    name: 'Alcoholvrije Athena-meuk',
    ownerId: '2',
    price: 50,
    picture: 'https://www.cocktailicious.nl/wp-content/uploads/2019/10/sex-on-the-beach.jpg',
    traySize: 1,
    category: 'drink',
    isAlcoholic: false,
    negative: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private cocktail: Product = {
    id: '4',
    name: 'Athena-meuk met alcohol',
    ownerId: '2',
    price: 150,
    picture: 'https://www.mitra.nl/cms/userfiles/cocktails/298-mojito43.png',
    traySize: 1,
    category: 'drink',
    isAlcoholic: true,
    negative: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  private bacFridge: Storage = {
    name: 'BAC-koelkast',
    id: '1',
    ownerId: '1',
    products: [this.beugel, this.tripel],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  private outdoorCocktails: Storage = {
    name: 'Athena-cocktails',
    id: '2',
    ownerId: '2',
    products: [this.alcoholFree, this.cocktail],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  private requestedPOS: PointOfSale = {
    name: 'SudoSOS-tablet',
    id: '1',
    ownerId: '1',
    storages: [this.bacFridge, this.outdoorCocktails],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  private ownerData: Object = {
    organName: 'Fictieve sjaarzencommissie',
    members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'],
  }

  // *************************************************
  //
  //               End test data
  //
  // *************************************************
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
