<template>
  <div>
    <!--  Table with all the banners  -->
    <b-card>
      <template v-slot:header>
        <b-button
          variant="primary"
          id="add"
          v-b-modal.modal-add
        >
          <font-awesome-icon icon="plus" /> {{ $t('bannerTable.Add') }}
        </b-button>
      </template>
      <b-card-body>
        <b-table
          stacked="sm"
          small
          borderless
          thead-class="table-header table-header-6"
          :items="bannerState.banners"
          :busy="bannerState.banners.length === 0"
          :fields="fields"
          per-page="perPage"
          :current-page="currentPage"
          class="table-striped"
        >
          <!-- If the table data is still loading display something nice -->
          <template #table-busy>
            <div class="text-center text-muted mt-5 mb-3">
              <b-spinner class="align-middle"></b-spinner>
            </div>
          </template>

          <!-- Templates for each row cell -->
          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.value" icon="check-circle"></font-awesome-icon>
          </template>

          <template v-slot:cell(picture)="data">
            <img class="thumbnail" :src="data.value" alt="Thumbnail">
          </template>

          <template v-slot:cell(id)="data">
            <a v-b-modal.modal-add v-on:click="updateCurrBanner(data)">
              <font-awesome-icon icon="pencil-alt" class="ml-2 icon click-icon"></font-awesome-icon>
            </a>
            <a v-b-modal.confirmation v-on:click="updateCurrBanner(data)">
              <font-awesome-icon icon="times" class="ml-2 icon click-icon"></font-awesome-icon>
            </a>
          </template>

        </b-table>
      </b-card-body>
    </b-card>

    <b-card-footer v-if="bannerState.banners.length > perPage" class="d-flex">
      <p class="my-auto h-100">
        {{ $t('bannerTable.Page') }}:
      </p>
      <b-pagination
        v-model="currentPage"
        :total-rows="bannerState.banners.length"
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

    <!--  Modal to ask if user really wants to delete something  -->
    <ConfirmationModal
      :title="$t('bannerTable.Confirm deletion')"
      :reason="$t('bannerTable.Are you sure')"
      @modalConfirmed="deleteBanner">
    </ConfirmationModal>

    <!--  Modal for adding new banners  -->
    <b-modal
      id="modal-add"
      :ok-title="$t('bannerTable.save')"
      :cancel-title="$t('bannerTable.cancel')"
      :title="$t('bannerTable.new banner')"
      size="lg"
      hide-header-close
      centered>
      <div id="add-modal-input">
        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('bannerTable.Name')"
          label-align="left"
          label-for="name"
          :state="nameState"
          :invalid-feedback="nameInvalid"
        >
          <b-form-input
            id="name"
            name="name"
            type="text"
            v-model="currBanner.name"
            :state="nameState"
          />
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('bannerTable.Duration')"
          label-align="left"
          label-for="duration"
          :state="durationState"
          :invalid-feedback="durationInvalid"
        >
          <b-form-input
            id="duration"
            name="duration"
            type="number"
            inputmode="decimal"
            v-model="currBanner.duration"
            :state="durationState"
          />
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('bannerTable.Start date')"
          label-align="left"
          label-for="start-date"
        >
          <b-form-input
            id="start-date"
            name="start-date"
            type="date"
            v-model="currBanner.startDate"
          />
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('bannerTable.End date')"
          label-align="left"
          label-for="end-date"
          :state="endDateState"
          :invalid-feedback="endDateInvalid"
        >
          <b-form-input
            id="start-date"
            name="start-date"
            type="date"
            v-model="currBanner.endDate"
            :state="endDateState"
          />
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('bannerTable.Banner')"
          label-align="left"
          label-for="ad-file"
        >
          <FileFormPreview v-model="file" :img="currBanner.picture"></FileFormPreview>
        </b-form-group>
      </div>

      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button
          variant="primary"
          class="btn-empty"
          @click="cancel()"
        >{{ $t('bannerTable.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="setBanner">
          {{ $t('bannerTable.save') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import FileFormPreview from '@/components/FileFormPreview.vue';
import { Banner } from '@/entities/Banner';
import Formatters from '@/mixins/Formatters';
import eventBus from '@/eventbus';
import BannerModule from '@/store/modules/banners';

@Component({
  components: { ConfirmationModal, FileFormPreview },
})
export default class BannerTable extends Formatters {
    private bannerState = getModule(BannerModule)

    // Variable that holds all information for adding a banner
    currBanner: Banner = {} as Banner;

    // File that user uploads
    file: File = new File([], '');

    perPage: number = 12;

    currentPage: number = 1;

    previousPage: number = 1;

    // Fields for the b-table
    fields: Object[] = [
      {
        key: 'picture',
        label: this.getTranslation('bannerTable.Thumbnail'),
        locale_key: 'Thumbnail',
      },
      {
        key: 'duration',
        label: this.getTranslation('bannerTable.Duration (ms)'),
        locale_key: 'Duration (ms)',
      },
      {
        key: 'active',
        label: this.getTranslation('bannerTable.Active'),
        locale_key: 'Active',
      },
      {
        key: 'startDate',
        label: this.getTranslation('bannerTable.Starts on'),
        locale_key: 'Starts on',
        formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      },
      {
        key: 'endDate',
        label: this.getTranslation('bannerTable.Stops on'),
        locale_key: 'Stops on',
        formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      },
      {
        key: 'id',
        label: this.getTranslation('bannerTable.Edit'),
        locale_key: 'Edit',
      },
    ];

    beforeMount() {
      this.bannerState.fetchBanners();

      // If the locale is changed make sure the labels are also correctly updated for the b-table
      eventBus.$on('localeUpdated', () => {
        this.fields = this.updateTranslations(this.fields, 'bannerTable');
      });
    }

    /**
     * Either posts a new banner or updates a current banner. If currBanner has an ID value set it
     * will update a currently existing banner otherwise it will create a new one.
     */
    setBanner() {
      this.currBanner.duration = Number(this.currBanner.duration);
      // TODO: Remove once we have real file upload
      this.currBanner.picture = URL.createObjectURL(this.file);

      if (this.currBanner.id === undefined) {
        this.bannerState.addBanner(this.currBanner);
      } else {
        this.bannerState.updateBanner(this.currBanner);
      }
      this.currBanner = {} as Banner;
      this.$bvModal.hide('modal-add');
    }

    /**
     * Sets this.currBanner to banner given to the function
     * @param updateBanner: banner that needs to be set to currBanner
     */
    updateCurrBanner(updateBanner: any): void {
      this.currBanner = updateBanner.item;
    }

    /**
     * Delete a banner that is currently set
     */
    deleteBanner() {
      this.bannerState.removeBanner(this.currBanner);
    }

    /**
     * Check if the name has been set
     */
    get nameState() {
      return this.currBanner.name !== undefined && this.currBanner.name.length > 0;
    }

    get nameInvalid() {
      if (!this.nameState) {
        return this.$t('bannerTable.Please enter name').toString();
      }

      return '';
    }

    /**
     * Check if duration is set and greater than 0.
     */
    get durationState(): boolean {
      return this.currBanner.duration > 0;
    }

    /**
     * If the durationState is invalid make sure a proper warning message is shown
     */
    get durationInvalid(): string {
      if (!this.durationState) {
        return this.$t('bannerTable.Please enter dur').toString();
      }
      return '';
    }

    /**
     * Check if the endDate is set and later than today
     */
    get endDateState(): boolean {
      return new Date(this.currBanner.endDate) > new Date()
        && this.currBanner.endDate !== undefined;
    }

    /**
     * If the endDateState is invalid make sure a proper warning message is shown
     */
    get endDateInvalid(): string {
      if (!this.endDateState) {
        return this.$t('bannerTable.End date should').toString();
      }
      return '';
    }

    /**
     * If we are going to page that is greater than the current page and we have not fetched all the
     * data for that page yet we need to fetch new data.
     *
     * @param page: the page we are currently going to
     */
    pageClicked(page: number) : void {
      if (this.previousPage < page
        && page >= (Math.ceil(this.bannerState.banners.length / this.perPage) - 2)) {
      // TODO: Grab new data
      }

      this.previousPage = page;
    }
}
</script>

<style scoped lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import './src/styles/Card.scss';

  .thumbnail {
    max-width: 4rem;
    max-height: 2.25rem;
  }

  .icon {
    color: black;
  }

  .click-icon {
    cursor: pointer;
  }

  @include media-breakpoint-down(xs) {
    .card-title {
      margin-bottom: 3.5rem;
    }
  }

  @include media-breakpoint-down(md) {
    .headless-cell {
      padding-left: 40%;
    }
  }
</style>
