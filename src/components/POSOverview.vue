import { POSStatus } from '@/entities/PointOfSale';
<template>
  <b-card class="container-card">
    <b-card-title class="mb-3 mb-lg-5">
      <b-form-row class="mx-0">
        <b-col cols="12" :lg="filter ?  8 : 12">
          <span v-if="requested">{{ $t('POSOverview.requested points of sale') }}</span>
          <span v-else>{{ $t('POSOverview.my points of sale')}}</span>
        </b-col>
        <b-col v-if="filter" cols="12" lg="4" class="text-right mt-2 mt-lg-0">
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
      <b-form-row class="point-of-sale" v-for="pos in pointsOfSale" :key="pos.id">
        <b-col :cols="full ? 6 : 10" :lg="full ? 3 : 11" class="order-0 font-weight-bold">
          {{ pos.name }}
        </b-col>
        <b-col v-if="full" cols="10" lg="4" class="smaller order-3 order-lg-2">
          {{ pos.ownerId }}
        </b-col>
        <b-col v-if="full" cols="6" lg="4" class="smaller text-right order-1 order-lg-3"
               :class="{'open': pos.status === 'OPEN',
                            'accepted': pos.status === 'ACCEPTED',
                            'rejected': pos.status === 'REJECTED'}">
          {{ $t(`POSOverview.${pos.status}`) }}
        </b-col>
        <b-col cols="2"  lg="1" class="text-right order-4">
          <font-awesome-icon icon="info-circle"></font-awesome-icon>
        </b-col>
      </b-form-row>
    </b-card-body>

    <b-card-footer v-if="perPage < pointsOfSaleFiltered.length" class="d-flex">
      <p class="my-auto h-100">
        {{ $t('POSOverview.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="pointsOfSaleFiltered.length"
        :per-page="perPage"
        limit="1"
        next-class="nextButton"
        prev-class="prevButton"
        page-class="pageButton"
        hide-goto-end-buttons
        last-number
        @change="pageClicked"
        aria-controls="transaction-table"
        class="custom-pagination mb-0"
      ></b-pagination>
    </b-card-footer>
  </b-card>
</template>


<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
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
    // If true the filter will show
    @Prop() private filter!: boolean;

    // If true all information about POS will show
    @Prop() private full!: boolean;

    // If true the title will be for requested pos's otherwise for your own pos's
    @Prop() private requested!: boolean;

    // To store all fetched points of sale
    pointsOfSaleStore: PointOfSale[] = [];

    // To store all fetched transaction with the filter applied
    pointsOfSaleFiltered: PointOfSale[] = [];

    // All the points of sale that will be displayed on the current page
    pointsOfSale: PointOfSale[] = [];

    // Show or hide processed Points of sale
    processed: boolean = false;

    previousPage: number = 0;

    currentPage: number = 1;

    perPage: number = 2;

    beforeMount() {
      this.pointsOfSaleStore = fetchMyPoints({} as User);
      this.filterItems(this.processed);
    }

    /*
    Method that grabs extra transactions when 2 pages or less are left
    */
    pageClicked(page: number) : void {
      if (this.previousPage < page
        && page >= (Math.ceil(this.pointsOfSaleFiltered.length / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.setPageItems(page);

      this.previousPage = page;
    }

    /*
    Method that puts the current page items into the pointsOfSale array

    @param page = page that is currently being navigated to
     */
    setPageItems(page: number = 1) : void {
      const sliceStart = (page - 1) * this.perPage;
      const sliceEnd = sliceStart + this.perPage;

      this.pointsOfSale = this.pointsOfSaleFiltered.slice(sliceStart, sliceEnd);
    }

    /*
    Method that filters the current points of sale present in the pointsOfSaleStore based on an
    input value

    @param value = If true then pages that have POSStatus.OPEN will be pushed to the filtered list
     */
    filterItems(value: boolean) : void {
      this.pointsOfSaleFiltered = [];

      if (value) {
        this.pointsOfSaleStore.forEach((pos) => {
          if (pos.status === POSStatus.OPEN) {
            this.pointsOfSaleFiltered.push(pos);
          }
        });
      } else {
        this.pointsOfSaleFiltered = this.pointsOfSaleStore;
      }

      this.setPageItems();
    }

    @Watch('processed')
    onProcessedChanged(value: boolean, old: boolean) {
      this.currentPage = 1;
      this.filterItems(value);
    }
}
</script>

<style lang="scss">
  .container-card {
    .custom-control-label::before,
    .custom-control-label::after {
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
  }
</style>
