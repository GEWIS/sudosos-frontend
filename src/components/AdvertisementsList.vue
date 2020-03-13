<template>
  <div>
    <b-card>
      <b-card-title>
        <b-button variant="primary" id="add" v-b-modal.modal-add>
          <font-awesome-icon icon="plus"></font-awesome-icon> Toevoegen
        </b-button>
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
                 :items="advertisementList" :fields="fields" class="table-striped">
          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.value" icon="check-circle"></font-awesome-icon>
          </template>
          <template v-slot:cell(thumbnail)="data">
            <img class="thumbnail" :src="data.value" alt="Thumbnail">
          </template>
          <template v-slot:cell(id)="data">
            <router-link :to="data.value">
              <font-awesome-icon icon="pencil-alt" class="ml-2 icon"></font-awesome-icon>
            </router-link>
            <router-link :to="data.value">
              <font-awesome-icon icon="times" class="ml-2 icon"></font-awesome-icon>
            </router-link>
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
        >
          <b-form-input
            id="duration"
            name="duration"
            type="number"
            v-model="duration"
            v-bind:state="Boolean(duration)"
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
export default class RecentAdvertisements extends Vue {
    @Prop({ type: Object as () => User }) private user!: User;

    advertisementList: Advertisement[] = [];

    active: boolean = false;

    file: File = new File([], '');

    duration: Number = 0;

    getTimeString = (value: Date) => `${this.parseTime(value.getDate())}-${this.parseTime(value.getMonth() + 1)}-${value.getFullYear()} - ${this.parseTime(value.getHours())}:${this.parseTime(value.getMinutes())}`;

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
        label: '',
        formatter: (value: String) => `/advertisements/${value}`,
      },
    ];

    beforeMount() {
      this.advertisementList = fetchAdvertisements();
    }

    @Watch('file')
    fileChanged : Function = (value: File, old: File) => {
      if (document.activeElement !== null) {
        let element = document.getElementById(document.activeElement.id) as HTMLElement;
        const img = document.createElement('img');
        img.setAttribute('src', URL.createObjectURL(value));
        img.style.maxHeight = '100%';
        img.style.maxWidth = `${element.offsetWidth}px`;

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

    parseTime = function parseTime(value: number): string {
      return (value < 10 ? '0' : '') + value;
    }
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

  @include media-breakpoint-down(xs) {
    .card-title {
      margin-bottom: 3.5rem;
    }
  }

  @include media-breakpoint-down(md) {
    tr {
      padding: 0.375rem 0 !important;
    }
  }
</style>
