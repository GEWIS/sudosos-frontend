<template>
  <div>
    <b-card>
      <b-card-title>
        <b-button
          variant="primary"
          id="add"
          v-b-modal.modal-add
          v-on:click="setAdvertisement('post')">
          <font-awesome-icon icon="plus"></font-awesome-icon> Toevoegen
        </b-button>
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header table-header-5"
                 :items="advertisementList" :fields="fields" class="table-striped">
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
            <a :to="data.value">
              <font-awesome-icon icon="times" class="ml-2 icon click-icon"></font-awesome-icon>
            </a>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
    <b-card-footer>
      YEET
    </b-card-footer>

    <b-modal
      id="modal-add"
      ok-title="save"
      cancel-title="cancel"
      title="new advertisement"
      size="lg"
      hide-header-close
      centered>
      <div id="add-modal-input">
        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          label="Duration"
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
          label="Active"
          label-align="left"
          label-for="active"
        >
          <b-form-checkbox
            id="active"
            name="active"
            v-model="active"
          >
            Active
          </b-form-checkbox>
        </b-form-group>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          label="Advertisement"
          label-align="left"
          label-for="ad-file"
        >
          <b-form-file
            id="ad-file"
            name="ad-file"
            v-model="file"
            accept="image/*"
            placeholder="Choose image or drop here..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
        </b-form-group>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Advertisement } from '@/entities/Advertisement';
import { User } from '@/entities/User';

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

  @Component
export default class AdvertisementsList extends Vue {
    @Prop({ type: Object as () => User }) private user!: User;

    advertisementList: Advertisement[] = [];

    active: Boolean = false;

    file: File = new File([], '');

    duration: Number = 10;

    method: string = '';

    currentActive: string = '';

    getTimeString = (value: Date) => `${AdvertisementsList.parseTime(value.getDate())}-`
                                      + `${AdvertisementsList.parseTime(value.getMonth() + 1)}-`
                                      + `${value.getFullYear()} - `
                                      + `${AdvertisementsList.parseTime(value.getHours())}:`
                                      + `${AdvertisementsList.parseTime(value.getMinutes())}`;

    fields: Object[] = [
      {
        key: 'thumbnail',
        label: 'Thumbnail',
      },
      {
        key: 'duration',
        label: 'Duur (ms)',
      },
      {
        key: 'active',
        label: 'Actief',
      },
      {
        key: 'added',
        label: 'Toegevoegd op',
        formatter: (value: Date) => this.getTimeString(value),
      },
      {
        key: 'id',
        label: 'Edit',
      },
    ];

    /*
      setAdvertisement sets the values that are shown in the modal are either set to those of the
      advertisement being modified or reset for a fresh advertisement.

      @param method : type of method that needs to be used when for the api request (e.g. post/put)
      @param id     : id of the advertisement currently being modified. -1 if not specified
     */
    async setAdvertisement(method: string, id: string = '-1') {
      this.method = method;

      if (id !== '-1') {
        const a = this.advertisementList.filter(s => s.id === id)[0];
        this.currentActive = id;
        this.duration = a.duration;
        this.active = a.active;
        // TODO: Fix that img is also shown in image preview box e.g. convert img to file
      } else {
        this.duration = 0;
        this.active = false;
      }
    }

    /*
      parseTime is a static method
     */
    static parseTime(value: number):String {
      return (value < 10 ? '0' : '') + value;
    }

    get durationState(): boolean {
      return this.duration > 0 && !Number.isNaN(this.duration.valueOf());
    }

    get durationInvalid(): string {
      if (!this.durationState) {
        return 'Please enter a valid number larger than 0';
      }
      return '';
    }

    beforeMount() {
      this.advertisementList = fetchAdvertisements();
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
  @import "~bootstrap/scss/bootstrap";
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
