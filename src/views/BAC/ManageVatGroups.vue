<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">
      {{ $t('manageVAT.Manage all VAT groups') }}
    </h1>

    <b-row>
      <b-col cols="12" class="containers-container">
        <div class="d-flex justify-content-between align-items-center">
          <p class="containers-header">{{ $t('manageVAT.VAT groups') }}</p>
          <b-button
            class="my-2 text-truncate"
            variant="success"
            v-on:click="prepAddingVatGroup({})"
          >
            <font-awesome-icon icon="plus" size="sm" class="mr-2" />
            {{ $t('manageVAT.Add VAT group') }}
          </b-button>
        </div>
        <VatGroupTable
          :vatGroupsProp="this.vatGroupState.vatGroups"
          :editable="true"
          :enabled="true"
          v-on:editVatGroup="prepEditStandardVatGroup"
        />
      </b-col>
    </b-row>

    <VatGroupEditModal
      :editVatGroup="editVatGroup"
    />
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import ContainerComponent from '@/components/ContainerComponent.vue';
import ContainerEditModal from '@/components/ContainerEditModal.vue';
import VatGroupEditModal from '@/components/VatGroupEditModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import { VatGroup, VatGroupList } from '@/entities/VatGroup';
import VatGroupTable from '@/components/VatGroupTable.vue';
import VatGroupModule from '@/store/modules/vatgroups';

@Component({
  components: {
    ContainerComponent,
    ContainerEditModal,
    VatGroupEditModal,
    ConfirmationModal,
    VatGroupTable,
  },
})

export default class ManageVatGroups extends Vue {
  private vatGroupState = getModule(VatGroupModule);

  editVatGroup: VatGroup = {} as VatGroup;

  async beforeMount() {
    await this.vatGroupState.fetchVatGroups();
  }

  /**
   * Method for preparing adding a VAT group
   */
  prepAddingVatGroup() : void {
    this.editVatGroup = {} as VatGroup;
    this.$bvModal.show('edit-vatGroup');
  }

  /**
   * Method for preparing editing a VAT group
   */
  prepEditStandardVatGroup(vatGroup: VatGroup): void {
    this.editVatGroup = vatGroup;
    this.$bvModal.show('edit-vatGroup');
  }
}
</script>

<style lang="scss" scoped>
//@import '~bootstrap/scss/bootstrap';
@import './src/styles/Card.scss';

.row {
  padding: 0 15px 0 15px;
}

.containers-container{
  border: 2px solid $gewis-grey-light;
  margin-bottom: 2rem;

  .containers-header {
    color: $gewis-red;
    font-size: 1em;
    font-weight: 600;
    text-transform: uppercase;
    margin: 1em 1em 1em 0;
  }
}
</style>
