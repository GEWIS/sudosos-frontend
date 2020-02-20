<template>
  <div>
    <div id="component-box">
      <h1>Overview</h1>
      <div id="own-pos">
        <b-card class="pos-card">
          <b-card-title class="box-title">
            my points of sale
          </b-card-title>
          <b-card-body>
            <div class="pos-lable">

              <!-- Display points of sale in myPoints -->
              <b-card>
                <div class="pos-display"
                      v-for="point in myPoints"
                      v-bind:key="point.name">
                  {{ point.name }} info
                </div>
              </b-card>
            </div>
          </b-card-body>
          <b-card-footer>
            PAGE 1/1
          </b-card-footer>
        </b-card>
      </div>
      <div id="request-pos">
        <b-card class="pos-card">
          <b-card-title class="box-title">
            <div id="request-pos-title">
              requested points of sale
            </div>
            <div id="pos-processed">
              PROCESSED
            </div>
          </b-card-title>
          <b-card-body>
            <div class="pos-lable">

              <!-- Display points of sale in requestedPoints -->
              <b-card>
                <div class="pos-display"
                      v-for="point in requestedPoints"
                      v-bind:key="point">
                  <div class="pos-name"> {{ point.name }} </div>
                  <div id="pos-person-id"> {{ point.id }} </div>
                  <div id="pos-status"> requestStatus </div>
                  <div class="pos-info"> info </div>
                </div>
              </b-card>
            </div>
          </b-card-body>
          <b-card-footer>
            PAGE 1/1
          </b-card-footer>
        </b-card>
        <!-- Different custom footer, closer resemblance to idea
        b-card class="page-selecter">
          <b-card-body>
          <div class="page-display">
            PAGE 1/1
          </div>
          </b-card-body>
        </b-card-->
      </div>
    </div>
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
  ] as PointOfSale[];

  return points;
}

@Component
export default class POSOverview extends Vue {
  // passed user prop
  @Prop({ type: Object as () => User }) private user!: User;

  // used to display points of sale
  myPoints: PointOfSale[] = [];

  // used to display point of sale requests
  requestedPoints: PointOfSale[] = [];

  beforeMount() {
    this.myPoints = fetchMyPoints(this.user);
    this.requestedPoints = fetchRequestedPoints(this.user);
  }
}
</script>

<style scoped lang="scss">
  @import './src/styles/Card.scss';

  #component-box {
    display: flex;
    justify-content: center;
  }

  #own-pos {
    padding-right: 15px;
  }

  // title of request section
  #request-pos-title {
    float: left;
  }
  #pos-processed {
    float: right;
    color: black;
  }

  // card dimensions
  .pos-card {
    width: 35rem;
    height: 35rem;
  }

  // pos display settings
  .pos-display {
    background-color: #f0f0f0;
    font-weight: bold;

    margin-bottom: .5rem;
    padding-top: 1rem;
    padding-left: 1rem;
    padding-bottom: 1rem;
  }

  .page-selecter {
    background-color: #f0f0f0;
  }

  .page-display {
    font-weight: bold;
  }

  .box-title {
    font-weight: bold;
  }

  .pos-name {
    width: 9rem;
    float: left;
    padding-right: 1rem;
  }

  #pos-person-id {
    width: 9rem;
    float: left;
    padding-right: 2rem;

    color: gray;
    font-size: .9em;
  }

  #pos-status {
    width: 8rem;
    float: left;
    padding-right: 1em;
  }
</style>
