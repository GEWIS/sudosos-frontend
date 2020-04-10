<template>
  <div>
    <ConfirmationModal
      :title="$t('advertisementList.Confirm deletion')"
      method="del"
      url=".."
      :reason="$t('advertisementList.Are you sure')"
      @modalConfirmed="modalConfirmed">
    </ConfirmationModal>
    <b-card>
      <b-card-title>
        <b-button
          variant="primary"
          id="add"
          v-b-modal.modal-add
          v-on:click="setAdvertisement('post')">
          <font-awesome-icon icon="plus"></font-awesome-icon> {{ $t('advertisementList.Add') }}
        </b-button>
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header table-header-5"
                 :items="advertisementList" :fields="fields" class="table-striped">
          <template v-slot:head(thumbnail)="data">
            <span v-if="data">{{ $t(`advertisementList.${data.label}`) }}</span>
          </template>

          <template v-slot:head(duration)="data">
            <span v-if="data">{{ $t(`advertisementList.${data.label}`) }}</span>
          </template>

          <template v-slot:head(active)="data">
            <span v-if="data">{{ $t(`advertisementList.${data.label}`) }}</span>
          </template>

          <template v-slot:head(added)="data">
            <span v-if="data">{{ $t(`advertisementList.${data.label}`) }}</span>
          </template>

          <template v-slot:head(id)="data">
            <span v-if="data">{{ $t(`advertisementList.${data.label}`) }}</span>
          </template>

          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.value" icon="check-circle"></font-awesome-icon>
          </template>
          <template v-slot:cell(thumbnail)="data">
            <img class="thumbnail" :src="data.value" alt="Thumbnail">
          </template>
          <template v-slot:cell(id)="data">
            <a v-b-modal.modal-add v-on:click="setAdvertisement('put', data.value)">
              <font-awesome-icon icon="pencil-alt" class="ml-2 icon click-icon"></font-awesome-icon>
            </a>
            <a v-b-modal.confirmation v-on:click="setConfirmation(data.value)" >
              <font-awesome-icon icon="times" class="ml-2 icon click-icon"></font-awesome-icon>
            </a>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      Hier moet nog pagination in dus dat komt nog een keertje hier
    </b-card-footer>

    <b-modal
      id="modal-add"
      :ok-title="$t('advertisementList.save')"
      :cancel-title="$t('advertisementList.cancel')"
      :title="$t('advertisementList.new advertisement')"
      size="lg"
      hide-header-close
      centered>
      <div id="add-modal-input">
        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('advertisementList.Duration')"
          label-align="left"
          label-for="duration"
          :state="durationState"
          :invalid-feedback="durationInvalid"
        >
          <b-form-input
            id="duration"
            name="duration"
            type="number"
            v-model="duration"
            :state="durationState"
          ></b-form-input>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('advertisementList.Active')"
          label-align="left"
          label-for="active"
        >
          <b-form-checkbox
            id="active"
            name="active"
            v-model="active"
          >
            {{ $t('advertisementList.Active') }}
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('advertisementList.Advertisement')"
          label-align="left"
          label-for="ad-file"
        >
          <b-form-file
            id="ad-file"
            name="ad-file"
            v-model="file"
            accept="image/*"
            :placeholder="$t('advertisementList.Choose image drop')"
            :drop-placeholder="$t('advertisementList.Drop file')"
          ></b-form-file>
        </b-form-group>
      </div>

      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button
          variant="primary"
          class="btn-empty"
          @click="cancel()"
        >{{ $t('advertisementList.cancel') }}
        </b-button>
        <b-button
          variant="primary"
          class="btn-empty"
          @click="ok()">
          {{ $t('advertisementList.save') }}
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { Advertisement } from '@/entities/Advertisement';
import { User } from '@/entities/User';
import Formatters from '@/mixins/Formatters';

function fetchAdvertisements() : Advertisement[] {
  const advertisements = [{
    id: '001',
    thumbnail: 'https://www.dafont.com/forum/attach/orig/5/6/561721.jpg',
    duration: 3600,
    active: true,
    added: new Date(),
  } as Advertisement,
  {
    id: '002',
    thumbnail: 'https://www.dafont.com/forum/attach/orig/5/6/561721.jpg',
    duration: 3600,
    active: true,
    added: new Date(),
  } as Advertisement,
  {
    id: '003',
    thumbnail: 'https://www.dafont.com/forum/attach/orig/5/6/561721.jpg',
    duration: 3600,
    active: false,
    added: new Date(),
  } as Advertisement,
  ] as Advertisement[];

  return advertisements.slice(0, 3);
}
@Component({
  components: { ConfirmationModal },
})
export default class AdvertisementsList extends Formatters {
    @Prop({ type: Object as () => User }) private user!: User;

    // List of advertisements
    advertisementList: Advertisement[] = [];

    // Variables for add advertisement modal
    active: Boolean = false;

    file: File = new File([], '');

    duration: Number = 0;

    // ID of currently opened advertisement
    currentActiveId: string = '';

    fields: Object[] = [
      {
        key: 'thumbnail',
        label: 'Thumbnail',
      },
      {
        key: 'duration',
        label: 'Duration (ms)',
      },
      {
        key: 'active',
        label: 'Active',
      },
      {
        key: 'added',
        label: 'Added on',
        formatter: (value: Date) => this.formatDateTime(value, undefined, true),
      },
      {
        key: 'id',
        label: 'Edit',
      },
    ];

    beforeMount() {
      this.advertisementList = fetchAdvertisements();
    }

    /*
      setAdvertisement sets the values that are shown in the modal are either set to those of the
      advertisement being modified or reset for a fresh advertisement.

      @param method : type of method that needs to be used when for the api request (e.g. post/put)
      @param id     : id of the advertisement currently being modified. -1 if not specified
     */
    async setAdvertisement(method: string, id: string) {
      if (id !== '-1') {
        const a = this.advertisementList.filter(s => s.id === id)[0];
        this.currentActiveId = id;
        this.duration = a.duration;
        this.active = a.active;
        // TODO: Fix that img is also shown in image preview box e.g. convert img to file
      } else {
        this.duration = 0;
        this.active = false;
      }
    }

    /*
      Method to handle data when the modal is confirmed
    */
    modalConfirmed() : void {
      // TODO do something when confirmed
      this.user = this.user;
    }

    get durationState(): boolean {
      return this.duration > 0 && !Number.isNaN(this.duration.valueOf());
    }

    get durationInvalid(): string {
      if (!this.durationState) {
        return this.$t('advertisementList.Please enter').toString();
      }
      return '';
    }

    @Watch('file')
    onFileChanged = (value: File, old: File) => {
      if (document.activeElement !== null) {
        let element = document.getElementById('ad-file') as HTMLElement;
        const img = document.createElement('img');
        img.setAttribute('src', URL.createObjectURL(value));
        img.style.maxHeight = '100%';
        img.style.maxWidth = `${element.offsetWidth - 48}px`;

        if (element.nextElementSibling !== null) {
          element = element.nextElementSibling as HTMLElement;
          element.style.height = '150px';
          element.style.padding = '0.75rem';
          element.innerHTML = '';
          element.appendChild(img);
          element = element.parentElement as HTMLElement;
          element.style.height = '150px';
        }
      }
    };
}

</script>

<style scoped lang="scss">
  @import '~bootstrap/scss/bootstrap';
  @import './src/styles/Card.scss';

  .thumbnail {
    width: 4rem;
    height: 2.25rem;
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
