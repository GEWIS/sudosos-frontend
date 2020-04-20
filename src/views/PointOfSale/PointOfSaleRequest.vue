<template>
  <b-container fluid="lg">
    <b-row>
    <h1 class="mb-2 mb-sm-2 mb-lg-2">
        {{ $t('posRequest.Request Point of Sale') }}
    </h1>
    </b-row>
    <hr>
    <b-row>
      <b-col md="3" sm="12">
        <h3>{{ $t('posRequest.General') }}</h3>
        <b>{{ $t('posRequest.Title') }}</b>
        <div>
            <b-form-input type="text" v-model="requestedPOS.name" :state="validateTitle">
            </b-form-input>
        <b-form-invalid-feedback>
            {{ $t('posRequest.Please enter a name for this POS')}}
        </b-form-invalid-feedback></div>
        <h3>{{ $t('posRequest.Management') }}</h3>
        <b>{{ $t('posRequest.Owner') }}</b>
        <div><b-form-select v-model="requestedPOS.ownerId"
            :options="availableOrgans" :state="validateOwner">
        </b-form-select>
        <b-form-invalid-feedback>
            {{ $t('posRequest.Please select an owner for this POS')}}
        </b-form-invalid-feedback></div>
        <b>{{ $t('posRequest.Managers') }}</b>
        <ul v-if="availableOrgans.find((organ) => organ.value === requestedPOS.ownerId)">
          <li v-for="member in
            availableOrgans.find((organ) => organ.value === requestedPOS.ownerId).members"
              v-bind:key="member">
            {{ member }}
          </li>
        </ul><br>
        <b-button variant="success" @click="requestPOS"
            :disabled="!(validateOwner && validateTitle)">
            {{ $t('posRequest.Request')}}
        </b-button>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
        <Container v-for="storage in availableContainers" v-bind:key="storage.id"
          :container="storage" :enabled="true"/>
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
    name: '',
    id: '',
    ownerId: '',
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  private availableOrgans: Object = [
    { value: '1', text: 'Fictieve sjaarzencommissie', members: ['Sjaars 1', 'Sjaars -1', 'Sjaars 65', 'Marcin van de Ven'] },
    { value: '2', text: 'Niet-fictieve sjaarzencommissie', members: ['Sjaars 3', 'Sjaars -0', 'Sjaars 8', 'Marcin van de Ven'] },
    { value: '3', text: 'Fictieve niet-sjaarzencommissie', members: ['Sjaars 2', 'Sjaars -10', 'Sjaars 88', 'Marcin van de Ven'] },
    { value: '4', text: 'Niet-fictieve niet-sjaarzencommissie', members: ['Sjaars 69', 'Sjaars -7', 'Sjaars 42', 'Marcin van de Ven'] },
  ];

  private availableContainers: Array<Storage> = [this.bacFridge, this.outdoorCocktails]

  // *************************************************
  //
  //               End test data
  //
  // *************************************************

  requestPOS() {
    // TODO: Verwerking data
    console.log(this.requestedPOS);
  }

  get validateTitle() {
    return this.requestedPOS.name.length > 0;
  }

  get validateOwner() {
    return this.requestedPOS.ownerId !== '';
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
