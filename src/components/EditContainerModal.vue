<template>
  <b-modal
    id="edit-container"
    :ok-title="$t('editContainerModal.save')"
    :cancel-title="$t('editContainerModal.cancel')"
    :title="Object.keys(editContainer).length > 0 ?
    $t('editContainerModal.edit container') :
    $t('editContainerModal.add container')"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">
      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editContainerModal.added on')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ formatDateTime(editContainer.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editContainerModal.added by')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ editContainer.ownerId }}
        </b-col>
      </b-form-row>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editContainerModal.Name')"
        label-align="left"
        label-for="name"
        :state="nameState"
        :invalid-feedback="invalidName"
      >
        <b-form-input
          id="name"
          name="name"
          type="text"
          v-model="name"
          :state="nameState"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editContainerModal.Open from')"
        label-align="left"
        label-for="openFrom"
        :state="openFromState"
        :invalid-feedback="invalidOpenFrom"
      >
        <b-form-input
          id="openFrom"
          name="openFrom"
          type="time"
          v-model="openFrom"
          :state="openFromState"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editContainerModal.Open till')"
        label-align="left"
        label-for="openTill"
        :state="openTillState"
        :invalid-feedback="invalidOpenTill"
      >
        <b-form-input
          id="openTill"
          name="openTill"
          type="time"
          v-model="openTill"
          :state="openTillState"
        ></b-form-input>
      </b-form-group>


    </div>

    <template v-slot:modal-footer="{ cancel }">
      <b-button
        variant="primary"
        class="btn-empty"
        @click="cancel()"
      >{{ $t('editContainerModal.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="save">
        {{ $t('editContainerModal.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';

  @Component
export default class EditContainerModal extends Formatters {
    @Prop() private editContainer! : Storage;

    // Name of the container
    name: string | null = null;

    // Open from input field
    openFrom: string | null = null;

    // Open till input field
    openTill: string | null = null;

    /*
    First check if form has been filled in correctly. Then check if we are adding an object or not
    if yes then make a Storage with the gathered data and emit this storage to the parent else make
    sure the storage we were editting gets updated correctly.
     */
    save(): void {
      if (this.nameState === null || !this.nameState) {
        this.name = '';
        this.openFrom = '';
        this.openTill = '';
      } else if (Object.keys(this.editContainer).length === 0) {
        const storage = {
          name: this.name,
          id: `00004_${this.name}`,
          ownerId: '1',
          products: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as Storage;

        this.$emit('storageAdded', storage);
      } else {
        const storage = this.editContainer;
        storage.name = this.name;
        storage.updatedAt = new Date();

        // TODO make sure data gets pushed somehow

        this.$emit('storageEdited', storage);
      }

      this.$bvModal.hide('edit-container');
    }

    // Check state of name
    get nameState(): boolean | null {
      return this.name === null ? null : this.name.length > 0;
    }

    // Return appropriate validating message for name
    get invalidName(): string {
      if (!this.nameState) {
        return this.$t('editContainerModal.name invalid').toString();
      }

      return '';
    }

    // Check state of openFrom
    get openFromState(): boolean | null{
      return this.openFrom === null ? null : this.openFrom.length > 0;
    }

    // Return appropriate validating message for openFrom
    get invalidOpenFrom(): string {
      if (!this.openFromState) {
        return this.$t('editContainerModal.openFrom invalid').toString();
      }

      return '';
    }

    // Check state of openTill
    get openTillState(): boolean | null {
      if (this.openTill === null || this.openFrom === null) {
        return null;
      }
      return this.openTill.length > 0 && this.openFrom < this.openTill;
    }

    // Return appropriate validating message for openTill
    get invalidOpenTill(): string {
      if (!this.openTillState) {
        return this.$t('editContainerModal.openTill invalid').toString();
      }

      return '';
    }

    @Watch('editContainer')
    onEditContainerChange(value: Storage, old: Storage) : void {
      if (Object.keys(value).length > 0) {
        this.name = value.name;
      } else {
        this.name = null;
      }
    }
}
</script>

<style lang="scss" scoped>
.form-row {
  margin: 0.75rem 0;
}
</style>
