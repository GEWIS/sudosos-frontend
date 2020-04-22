<template>
  <b-container fluid="lg">
    <b-row>
    <h1 class="mb-2 mb-sm-2 mb-lg-2">
        {{ $t('posRequest.Request Point of Sale') }}
    </h1>
    </b-row>
    <hr>
    <b-row>
      <b-col md="3" sm="12">
        <h3>{{ $t('posRequest.General') }}</h3>
        <b>{{ $t('posRequest.Title') }}</b>
        <b-form-input type="text" v-model="requestedPOS.name"></b-form-input>
        <b>{{ $t('posRequest.Selected containers')}}</b>
        <ul>
            <li v-for="storage in requestedPOS.storages" v-bind:key="storage.id">
                {{ storage.name }}
            </li>
        </ul>
        <h3>{{ $t('posRequest.Management') }}</h3>
        <b>{{ $t('posRequest.Owner') }}</b>
        <b-form-select v-model="requestedPOS.ownerId" :options="availableOrgans">
        </b-form-select>
        <b>{{ $t('posRequest.Managers') }}</b>
        <ul v-if="availableOrgans.find((organ) => organ.value === requestedPOS.ownerId)">
          <li v-for="member in
            availableOrgans.find((organ) => organ.value === requestedPOS.ownerId).members"
              v-bind:key="member">
            {{ member }}
          </li>
        </ul><br>
        <b-button variant="success" @click="requestPOS"
            :disabled="requestButtonDisabled">
            {{ $t('posRequest.Request')}}
        </b-button>
      </b-col>
      <b-col md="9" sm="12" class="containers-container">
        <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
        <Container v-for="storage in availableContainers" v-bind:key="storage.id"
          :container="storage" :enabled="true" @toggled="containerToggled"/>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { Storage } from '@/entities/Storage';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';
import PointsOfSale from '@/assets/pointsOfSale';

  @Component({
    components: { Container },
  })

export default class PointOfSaleRequest extends Vue {
    requestedPOS: PointOfSale = {
      name: '',
      id: '',
      ownerId: '',
      status: POSStatus.OPEN,
      storages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    availableContainers: Storage[] = [];

    availableOrgans: Object = [];

    beforeMount() {
      this.availableContainers = PointsOfSale.getAvailableContainers();
      this.availableOrgans = PointsOfSale.getAvailableOrgans();
    }


    // eslint-disable-next-line class-methods-use-this
    requestPOS() {
    // TODO: Verwerking data
    }

    containerToggled(containerData: any) {
      const updatedContainer = this.availableContainers
        .find(storage => storage.id === containerData.id);

      if (updatedContainer) {
        if (containerData.state) {
          this.requestedPOS.storages.push(updatedContainer);
        } else {
        // Using a filter to remove items from an object array
          this.requestedPOS.storages = this.requestedPOS.storages
            .filter(storage => storage.id !== updatedContainer.id);
        }
      }
    }

    get requestButtonDisabled() {
      return this.requestedPOS.name.length < 1 || this.requestedPOS.ownerId === '';
    }
}
</script>

<style lang="scss" scoped>
  .approve-reject-buttons{
    button {
      margin-right: 8px;
      min-width: 100px;
    }
  }
  .containers-container{
    border: 2px solid $gewis-grey-light;

    .containers-header {
      color: $gewis-red;
      font-size: 1em;
      font-weight: 600;
      text-transform: uppercase;
      margin: 1em;
    }
  }
</style>
