<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-2 mb-lg-2">
        {{ $t('posRequest.Request Point of Sale') }}
    </h1>
    <hr>
    <b-row cols-lg="mx-0">
      <b-col md="3" sm="12" class="mb-4 mb-md-0">
        <h5>{{ $t('posRequest.General') }}</h5>
        <div class="pl-1">
          <b>{{ $t('posRequest.Title') }}</b>
          <b-form-input class="my-2" type="text" v-model="requestedPOS.name" />
          <b>{{ $t('posRequest.Selected containers')}}</b>
          <ul>
              <li v-for="storage in requestedPOS.storages" v-bind:key="storage.id">
                  {{ storage.name }}
              </li>
          </ul>
        </div>
        <h5>{{ $t('posRequest.Management') }}</h5>
        <div class="pl-1">
          <b>{{ $t('posRequest.Owner') }}</b>
          <b-form-select class="my-2" v-model="requestedPOS.ownerId" :options="availableOrgans">
          </b-form-select>
          <ul v-if="availableOrgans.find((organ) => organ.value === requestedPOS.ownerId)"
              class="pl-4">
            <li v-for="member in
              availableOrgans.find((organ) => organ.value === requestedPOS.ownerId).members"
                v-bind:key="member">
              {{ member }}
            </li>
          </ul>
        </div>
        <b-button class="mt-2" variant="success" @click="requestPOS"
            :disabled="requestButtonDisabled">
            {{ $t('posRequest.Request')}}
        </b-button>
      </b-col>

      <b-col md="9" sm="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('posRequest.Containers') }}</p>
          <b-button class="my-2" variant="success">
            <font-awesome-icon icon="plus" />
            {{ $t('posRequest.add container') }}
          </b-button>
        </div>
        <Container v-for="storage in availableContainers"
                   v-bind:key="storage.id"
                   :container="storage"
                   :enabled="true"
                   @toggled="containerToggled"
                   v-model="editContainer"
        />
      </b-col>
    </b-row>

    <EditContainerModal :editContainer="editContainer" />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';
import { Storage } from '@/entities/Storage';
import { PointOfSale, POSStatus } from '@/entities/PointOfSale';
import PointsOfSale from '@/assets/pointsOfSale';
import EditContainerModal from '@/components/EditContainerModal.vue';

  @Component({
    components: { Container, EditContainerModal },
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

    editContainer: Storage = {} as Storage;

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
