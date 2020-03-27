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
                  <b-col class="point-name"
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
                <b-form-group class="section-title">
                  requested points of sale
                </b-form-group>
                <b-form-group
                  id="processed"
                  label-cols="0"
                  class="mt-xl-0 mb-xl-3 my-lg-auto"
                >
                  <b-form-checkbox
                    id="processed-input"
                    name="processed-input"
                    v-model="processed"
                    :value="true"
                    :unchecked-value="false"
                  >
                    processed
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
                  <b-col class="point-name"
                      cols="4">
                    {{ point.name }}
                  </b-col>
                  <b-col cols="3">
                    {{ point.id }}
                  </b-col>
                  <b-col cols="4">
                    requestStatus
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { PointOfSale } from '@/entities/PointOfSale';

// Points of sale to display in My points of sale
function fetchMyPoints(user: User) : PointOfSale[] {
  // testing points
  const points = [{
    name: 'myName',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName2',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName3',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  ] as PointOfSale[];

  return points;
}

// Points of sale to display in Requested points of sale
function fetchRequestedPoints(user: User) : PointOfSale[] {
  // testing points
  const points = [{
    name: 'requestedName',
    id: 'requestedID',
    ownerId: 'requestedOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'requestedName2',
    id: 'requestedID',
    ownerId: 'requestedOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'requestedName3',
    id: 'requestedID',
    ownerId: 'requestedOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  ] as PointOfSale[];

  return points;
}

@Component
export default class POSOverview extends Vue {
  // passed user prop
  @Prop({ type: Object as () => User }) private user!: User;

  // used to display users points of sale
  myPoints: PointOfSale[] = [];

  // used to display users point of sale requests
  requestedPoints: PointOfSale[] = [];

  beforeMount() {
    this.myPoints = fetchMyPoints(this.user);
    this.requestedPoints = fetchRequestedPoints(this.user);
  }
}
</script>

<style scoped lang="scss">
  @import "~bootstrap/scss/bootstrap";
  @import './src/styles/Card.scss';

  .section-title {
    font-weight: bold;
  }

  // processed text color
  #processed {
    color: black;
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

  .point-name {
    font-weight: bold;
  }
</style>
