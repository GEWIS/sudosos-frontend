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
        <Container v-for="storage in requestedPOS.storages" v-bind:key="storage.id"
                   :container="storage" :enabled="false"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { PointOfSale } from '@/entities/PointOfSale';
import PointsOfSale from '@/assets/pointsOfSale';

  @Component({
    components: { Container },
  })

export default class PointOfSaleApprove extends Vue {
    requestedPOS: PointOfSale = {} as PointOfSale;

    ownerData: Object = {};


    beforeMount() {
      this.requestedPOS = PointsOfSale.getPointOfSale();
      this.ownerData = PointsOfSale.getOwnerData();
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
