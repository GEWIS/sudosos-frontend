<template>
  <b-row>
    <b-col cols="12" md="6" class="mb-md-0 mb-3 container-card">
      <b-card>
        <b-card-title>
          {{ $t('POSOverview.my points of sale') }}
        </b-card-title>

        <b-card-body>
          <b-row class="point-of-sale" v-for="pos in pointsOfSaleOwned" :key="pos.id">
            <b-col cols="10" class="font-weight-bold">{{ pos.name }}</b-col>
            <b-col cols="2" class="text-right">
              <font-awesome-icon icon="info-circle"></font-awesome-icon>
            </b-col>
          </b-row>
        </b-card-body>
      </b-card>
    </b-col>

    <b-col cols="12" md="6" class="container-card">
      <b-card>
        <b-card-title>
          <b-form-row class="mx-0">
            <b-col cols="12" lg="8">
          {{ $t('POSOverview.requested points of sale') }}
            </b-col>
            <b-col cols="12" lg="4" class="text-right mt-2 mt-lg-0">
          <b-form-group
            id="processed"
            label-cols="0"
            class="mb-0"
          >
            <b-form-checkbox
            id="processed-input"
            name="processed-input"
            v-model="processed"
            :value="true"
            :unchecked-value="false"
            >
              {{ $t('POSOverview.processed') }}
            </b-form-checkbox>
          </b-form-group>
            </b-col>
          </b-form-row>
        </b-card-title>

        <b-card-body>
          <b-form-row class="point-of-sale" v-for="pos in pointsOfSaleRequested" :key="pos.id">
            <b-col cols="6" lg="3" class="order-0 font-weight-bold">{{ pos.name }}</b-col>
            <b-col cols="10" lg="4" class="smaller order-3 order-lg-2">{{ pos.ownerId }}</b-col>
            <b-col cols="6" lg="4" class="smaller text-right order-1 order-lg-3"
                   :class="{'open': pos.status === 'OPEN',
                            'accepted': pos.status === 'ACCEPTED',
                            'rejected': pos.status === 'REJECTED'}" >
              {{ $t(`POSOverview.${pos.status}`) }}
            </b-col>
            <b-col cols="2"  lg="1" class="text-right order-4">
              <font-awesome-icon icon="info-circle"></font-awesome-icon>
            </b-col>
          </b-form-row>
        </b-card-body>
      </b-card>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';

// Points of sale to display in My points of sale
function fetchMyPoints(user: User) : PointOfSale[] {
  // testing points
  const points = [{
    name: 'posName',
    id: 'myID',
    ownerId: 'myOwnerID',
    status: POSStatus.OPEN,
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'posName2',
    id: 'myID',
    ownerId: 'myOwnerID',
    status: POSStatus.ACCEPTED,
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'posName3',
    id: 'myID',
    ownerId: 'myOwnerID',
    status: POSStatus.REJECTED,
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  ] as PointOfSale[];

  return points;
}

@Component
export default class POSOverview extends Vue {
  // used to display users points of sale
  pointsOfSaleOwned: PointOfSale[] = [];

  // used to display users point of sale requests
  pointsOfSaleRequested: PointOfSale[] = [];

  // Show or hide processed Points of sale
  processed: boolean = false;

  beforeMount() {
    this.pointsOfSaleOwned = fetchMyPoints({} as User);
    this.pointsOfSaleRequested = fetchMyPoints({} as User);
  }
}
</script>

<style lang="scss">
  .container-card {
    .custom-control-label::before {
      top: 1px !important;
    }
  }
</style>

<style scoped lang="scss">
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

  .point-of-sale {
    background-color: rgba(242, 242, 242, 1);
    margin: 0.5rem 0;
    padding: 0.5rem 1rem;
    cursor: pointer;

    .open {
      color: $gewis-grey;
    }

    .accepted {
      color: $success;
    }

    .rejected {
      color: $danger;
    }

    .smaller {
      font-size: 0.8rem;
      margin-top: auto;
    }

    > div:nth-of-type(2){
      color: $gewis-grey;
    }

    > div:nth-of-type(3) {
      text-transform: uppercase;
    }

    svg {
      color: $gewis-grey;
    }
  }

  #processed {
    color: black;

    > div > div > .custom-control-label::before {
      top: 2px !important;
    }

    label::before {
      top: 2px !important;
    }
  }

  #processed-input::after {
    top: 2px !important;
  }
</style>
