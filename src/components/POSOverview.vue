<template>
  <div>
    <b-row>
      <b-col class="mb-4">
        <div id="own-pos">
          <b-card class="pos-card">
            <b-card-title>
              <div class="section-title">
                my points of sale
              </div>
            </b-card-title>
            <b-card-body>

              <!-- Display points of sale in myPoints -->
              <div class="pos-labels"
                    v-for="point in myPoints"
                    v-bind:key="point">
                <b-row class="pos-single-label mb-2 mx-1 py-2">
                  <b-col class="pos-name"
                      cols="11">
                    {{ point.name }}
                  </b-col>
                  <b-col cols="1">
                    <router-link :to="'pos/' + point.id" class="info-link">
                      <font-awesome-icon icon="info-circle" class="icon"/>
                    </router-link>
                  </b-col>
                </b-row>
              </div>
            </b-card-body>
          </b-card>
          <b-card-footer>
            PAGE
          </b-card-footer>
        </div>
      </b-col>
      <b-col>
        <div id="request-pos">
          <b-card class="pos-card">
            <b-card-title>
              <b-form-row class="justify-content-between">
                <b-form-group class="section-title mb-0">
                  requested points of sale
                </b-form-group>
                <b-form-group
                  label-cols="0"
                  id="pos-checkbox"
                >
                  <b-form-checkbox
                    id="processed-input"
                    name="processed-input"
                    v-model="processed"
                    :value="true"
                    :unchecked-value="false"
                  >
                    <div id="pos-checkbox-title"> processed </div>
                  </b-form-checkbox>
                </b-form-group>
              </b-form-row>
            </b-card-title>
            <b-card-body>

              <!-- Display points of sale in requestedPoints -->
              <div class="pos-labels"
                    v-for="point in requestedPoints"
                    v-bind:key="point">
                <b-row class="pos-single-label mb-2 mx-1 py-2">
                  <b-col class="pos-name"
                      cols="3">
                    {{ point.name }}
                  </b-col>
                  <b-col class="pl-0"
                      cols="4">
                    {{ point.id }}
                  </b-col>
                  <b-col class="pl-xl-5"
                      style="color: green;"
                      cols="4">
                    ACCEPTED
                  </b-col>
                  <b-col cols="1">
                    <router-link :to="'pos/' + point.id" class="info-link">
                      <font-awesome-icon icon="info-circle" class="icon"/>
                    </router-link>
                  </b-col>
                </b-row>
              </div>
            </b-card-body>
          </b-card>
          <b-card-footer>
            PAGE
          </b-card-footer>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { PointOfSale } from '@/entities/PointOfSale';

// Points of sale to display in My points of sale
function fetchMyPoints(user: User) : PointOfSale[] {
  // testing points
  const points = [{
    name: 'posName',
    id: 'myID',
    ownerId: 'myOwnerID',
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'posName2',
    id: 'myID',
    ownerId: 'myOwnerID',
    storages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'posName3',
    id: 'myID',
    ownerId: 'myOwnerID',
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
  myPoints: PointOfSale[] = [];

  // used to display users point of sale requests
  requestedPoints: PointOfSale[] = [];

  beforeMount() {
    this.myPoints = fetchMyPoints({} as User);
    this.requestedPoints = fetchMyPoints({} as User);
  }
}
</script>

<style scoped lang="scss">
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

  .section-title {
    font-weight: bold;
  }

  .info-link {
    display: block;
    color: initial;
    width: 100%;
  }
  .icon {
    color: $gewis-grey;
  }

  .pos-single-label {
    background-color: #f2f2f2;
  }

  .pos-name {
    font-weight: bold;
  }

  // custom check box locations as it didn't want to listen to me
  #pos-checkbox {
    margin-top: -.2rem;
    margin-bottom: -.2rem;
  }
  #pos-checkbox-title {
    color: black;
    margin-top: .18rem;
  }

  @include media-breakpoint-down(lg) {
    .icon {
      margin-left: -.5rem;
    }

    .pos-name {
      font-size: .91rem;
    }
  }
</style>
