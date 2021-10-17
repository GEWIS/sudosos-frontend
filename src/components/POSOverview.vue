<template>
  <!-- TODO: Add separate call for POSs that have not yet been approved -->
  <b-card class="container-card">
    <b-card-title class="mb-3 mb-lg-5">
      <b-form-row class="mx-0">
        <b-col cols="12">
          <span v-if="requested">{{ $t('c_POSOverview.requested points of sale') }}</span>
          <span v-else>{{ $t('c_POSOverview.my points of sale') }}</span>
        </b-col>
      </b-form-row>
    </b-card-title>

    <b-card-body>
      <b-form-row
        class="point-of-sale"
        v-for="pos in shownPointsOfSale"
        :key="pos.id"
        @click="$router.push({
        name: full ? 'pointOfSaleApprove' : 'pointOfSaleInfo',
        params: {id: pos.id} })">
        <b-col
          :cols="full ? 6 : 10" :lg="full ? 5 : 11"
          class="order-0 font-weight-bold overflow-hidden pos-name"
        >
          {{ pos.name }}
        </b-col>
        <b-col
          v-if="full"
          cols="10"
          lg="6"
          class="smaller order-3 order-lg-2 overflow-hidden pos-owner"
        >
          {{ pos.owner.name }}
        </b-col>
        <b-col cols="2" lg="1" class="text-right order-4 pos-info">
          <font-awesome-icon icon="info-circle"/>
        </b-col>
      </b-form-row>
    </b-card-body>

    <b-card-footer v-if="perPage < pointsOfSale.length" class="d-flex">
      <p class="my-auto h-100">
        {{ $t('c_POSOverview.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="pointsOfSale.length"
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
  Component, Prop, Vue,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { PointOfSale } from '@/entities/PointOfSale';
import PointOfSaleModule from '@/store/modules/pointsofsale';

@Component
export default class POSOverview extends Vue {
  // If true all information about POS will show
  @Prop() private full!: boolean;

  // If true the title will be for requested pos's otherwise for your own pos's
  @Prop() private requested!: boolean;

  private pointOfSaleState = getModule(PointOfSaleModule);

  // All the points of sale that will be displayed on the current page
  pointsOfSale: PointOfSale[] = [];

  shownPointsOfSale: PointOfSale[] = [];

  previousPage: number = 1;

  currentPage: number = 1;

  perPage: number = 1;

  beforeMount() {
    this.pointOfSaleState.fetchPointsOfSale();
    this.pointsOfSale = this.pointOfSaleState.pointsOfSale;

    this.shownPointsOfSale = this.pointsOfSale.slice(0, this.perPage);
  }

  /**
   * Method that grabs extra transactions when 2 pages or less are left
   *
   * @param page = page that is being navigated to
   */
  pageClicked(page: number): void {
    if (this.previousPage < page
      && page >= (Math.ceil(this.pointsOfSale.length / this.perPage) - 2)) {
      // TODO: Grab new data
    }

    const start = (page - 1) * this.perPage;
    this.shownPointsOfSale = this.pointsOfSale.slice(start, start + this.perPage);

    this.previousPage = page;
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

  > .pos-owner {
    color: $gewis-grey;
  }

  .pos-info {
    color: $gewis-grey;
  }
}

.point-of-sale:hover {
  background-color: rgba(234, 234, 234, 1);

  > .pos-info {
    color: black !important;
  }
}

#processed {
  color: black;
}
</style>
