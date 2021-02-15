<template>
  <!-- TODO: Remove filter, add seperate call for POSs that have not yet been approved -->
  <b-card class="container-card">
    <b-card-title class="mb-3 mb-lg-5">
      <b-form-row class="mx-0">
        <b-col cols="12" :lg="filter ?  8 : 12">
          <span v-if="requested">{{ $t('POSOverview.requested points of sale') }}</span>
          <span v-else>{{ $t('POSOverview.my points of sale') }}</span>
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
              :value="false"
              :unchecked-value="true"
            >
              {{ $t('POSOverview.processed') }}
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-card-title>

    <b-card-body>
      <b-form-row
        class="point-of-sale"
        v-for="pos in pointsOfSale.slice(currentPage * perPage, currentPage * perPage + perPage)"
        :key="pos.id"
        @click="$router.push({
        name: full ? 'pointOfSaleApprove' : 'pointOfSaleInfo',
        params: {id: pos.id} })">
        <b-col :cols="full ? 6 : 10" :lg="full ? 3 : 11" class="order-0 font-weight-bold">
          {{ pos.name }}
        </b-col>
        <b-col v-if="full" cols="10" lg="4" class="smaller order-3 order-lg-2">
          {{ pos.owner.name }}
        </b-col>
        <b-col cols="2"  lg="1" class="text-right order-4">
          <font-awesome-icon icon="info-circle" />
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
      />
    </b-card-footer>
  </b-card>
</template>


<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { PointOfSale } from '@/entities/PointOfSale';
import PointOfSaleModule from '@/store/modules/pointsofsale';

  @Component
export default class POSOverview extends Vue {
    // If true the filter will show
    @Prop() private filter!: boolean;

    // If true all information about POS will show
    @Prop() private full!: boolean;

    // If true the title will be for requested pos's otherwise for your own pos's
    @Prop() private requested!: boolean;

    private pointOfSaleState = getModule(PointOfSaleModule);

    // To store all fetched transaction with the filter applied
    pointsOfSaleFiltered: PointOfSale[] = [];

    // All the points of sale that will be displayed on the current page
    pointsOfSale: PointOfSale[] = [];

    // Show or hide processed Points of sale
    processed: boolean = false;

    previousPage: number = 0;

    currentPage: number = 0;

    perPage: number = 2;

    beforeMount() {
      this.pointOfSaleState.fetchPointsOfSale();
      this.pointsOfSale = this.pointOfSaleState.pointsOfSale;
    }

    /**
     * Method that grabs extra transactions when 2 pages or less are left
     *
     * @param page = page that is being navigated to
     */
    pageClicked(page: number) : void {
      if (this.previousPage < page
        && page >= (Math.ceil(this.pointsOfSaleFiltered.length / this.perPage) - 2)) {
        // TODO: Grab new data
      }

      this.previousPage = page;
    }

    @Watch('processed')
    onProcessedChanged(value: boolean, old: boolean) {
      this.currentPage = 1;
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

  .point-of-sale:hover {
    background-color: rgba(234, 234, 234, 1);
  }

  #processed {
    color: black;
  }
</style>
