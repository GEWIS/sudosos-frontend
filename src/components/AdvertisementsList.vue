<template>
  <div>
    <b-card>
      <b-card-title>
        <b-button variant="primary">
          <font-awesome-icon icon="plus"></font-awesome-icon> Toevoegen
        </b-button>
      </b-card-title>
      <b-card-body>
        <b-table stacked="sm" small borderless thead-class="table-header"
                 :items="advertisementList" :fields="fields">
          <template v-slot:cell(active)="data">
            <font-awesome-icon v-if="data.value" icon="check-circle"></font-awesome-icon>
          </template>
          <template v-slot:cell(thumbnail)="data">
            <img class="thumbnail" :src="data.value" alt="Thumbnail">
          </template>
          <template v-slot:cell(id)="data">
            <router-link :to="data.value">
              <font-awesome-icon icon="pencil-alt" style="margin-left: 0.5rem;
              color: black;"></font-awesome-icon>
            </router-link>
            <router-link :to="data.value">
              <font-awesome-icon icon="times" style="margin-left: 0.5rem;
              color: black;"></font-awesome-icon>
            </router-link>
          </template>
        </b-table>
      </b-card-body>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
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

    // getTimeString = (value: Date) => value.

    getTimeString = (value: Date) => `${this.parseTime(value.getDate())}-${this.parseTime(value.getMonth() + 1)}-${value.getFullYear()} - ${this.parseTime(value.getHours())}:${this.parseTime(value.getMinutes())}`;

    getCheckmark = (value: Boolean) => { if (value) { return 'check-circle'; } return ''; };

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
        // formatter: (value: Boolean) => this.getCheckmark(value),
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

    parseTime = function parseTime(value: number): string {
      return (value < 10 ? '0' : '') + value;
    }
}

</script>

<style scoped lang="scss">
  @import './src/styles/Card.scss';

  .thumbnail {
    width: 4rem;
    height: 2.25rem;
  }
</style>
