<template>
  <div>
    <div id="component-box">
      <div id="own-pos">
        <b-card class="pos-card">
          <b-card-title class="box-title">
              my points of sale
          </b-card-title>
          <b-card-body>
            <div class="pos-label">

              <!-- Display points of sale in myPoints -->
              <div class="pos-display"
                    v-for="point in myPoints"
                    v-bind:key="point">
                <div class="pos-name"> {{ point.name }} </div>
                <div class="pos-info">
                  <router-link :to="'pos/' + point.id" class="info-link">
                    <font-awesome-icon icon="info-circle"/>
                  </router-link>
                </div>
              </div>
            </div>
          </b-card-body>
        </b-card>
        <b-card-footer>
          PAGE {{ myPageNum }}/{{ numOfMyPages }}
          <b-button v-on:click="myPageNum -= 1">
            <font-awesome-icon icon="chevron-left"/>
          </b-button>
          <b-button v-on:click="myPageNum += 1">
            <font-awesome-icon icon="chevron-right"/>
          </b-button>
        </b-card-footer>
      </div>
      <div id="request-pos">
        <b-card class="pos-card">
          <b-card-title class="box-title">
              requested points of sale
            <div id="pos-processed">

              <!-- PROCESSED checkbox -->
              <b-form-checkbox id="checkbox" v-model="checked">PROCESSED</b-form-checkbox>
            </div>
          </b-card-title>
          <b-card-body>
            <div class="pos-label">

              <!-- Display points of sale in requestedPoints -->
              <div class="pos-display"
                    v-for="point in requestedPoints"
                    v-bind:key="point">
                <div class="pos-name"> {{ point.name }} </div>
                <div id="pos-person-id"> {{ point.id }} </div>
                <div id="pos-status"> requestStatus </div>
                <router-link :to="'pos/' + point.id" class="info-link">
                  <font-awesome-icon icon="info-circle"/>
                </router-link>
              </div>
            </div>
          </b-card-body>
        </b-card>
        <b-card-footer>
          PAGE {{ reqPageNum }}/{{ numOfReqPages }}
          <b-button v-on:click="reqPageNum -= 1">
            <font-awesome-icon icon="chevron-left"/>
          </b-button>
          <b-button v-on:click="reqPageNum += 1">
            <font-awesome-icon icon="chevron-right"/>
          </b-button>
        </b-card-footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';
import { PointOfSale } from '@/entities/PointOfSale';

// display at most displayLim po sales
const displayLim = 5;

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
  {
    name: 'myName4',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName5',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName6',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName7',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName8',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  {
    name: 'myName9',
    id: 'myID',
    ownerId: 'myOwnerID',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as PointOfSale,
  ] as PointOfSale[];

  // return effective slice
  const myPageNum = 0; // my pagenum placeholder
  return points.slice(
    Math.min(myPageNum * displayLim, points.length - (points.length % displayLim)),
    Math.min((myPageNum + 1) * displayLim, points.length),
  );
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

  // return effective slice
  const reqPageNum = 0; // req pagenum placeholder
  return points.slice(
    Math.min(reqPageNum * displayLim, points.length - (points.length % displayLim)),
    Math.min((reqPageNum + 1) * displayLim, points.length),
  );
}

// return number of my pos pages
function fetchNumOfMyPages() {
  return 0;
}

// return number of requested pos pages
function fetchNumOfReqPages() {
  return 0;
}

@Component
export default class POSOverview extends Vue {
  // passed user prop
  @Prop({ type: Object as () => User }) private user!: User;

  // used to display users points of sale
  myPoints: PointOfSale[] = [];

  // used to display users point of sale requests
  requestedPoints: PointOfSale[] = [];

  // my page number
  myPageNum: Number = 0;

  // requested page number
  reqPageNum: Number = 0;

  // number of my pages
  numOfMyPages: Number = 0;

  // number of req pages
  numOfReqPages: Number = 0;

  beforeMount() {
    this.myPoints = fetchMyPoints(this.user);
    this.requestedPoints = fetchRequestedPoints(this.user);
    this.numOfMyPages = fetchNumOfMyPages();
    this.numOfReqPages = fetchNumOfReqPages();
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
    background-color: #f2f2f2;
    font-weight: bold;

    margin-bottom: .5rem;
    padding-top: 1rem;
    padding-left: 1rem;
    padding-bottom: 1rem;
  }

  // requested POS display
  .pos-name {
    width: 9rem;
    display: inline-block;
    padding-right: 1rem;
  }
  #pos-person-id {
    width: 9rem;
    display: inline-block;
    padding-right: 2rem;

    color: gray;
    font-size: .9em;
  }
  #pos-status {
    width: 8rem;
    display: inline-block;
    padding-right: 1em;
  }
  .pos-info {
    padding-right: 1rem;
    float: right;
  }

  // info links
  .info-link {
    color: black;
  }
  .info-link:hover {
    color: gray;
  }
</style>
