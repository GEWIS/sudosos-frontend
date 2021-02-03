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
          {{ editContainer.owner.name }}
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
          v-model="currContainer.name"
          :state="nameState"
        />
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editContainerModal.Public')"
        label-align="left"
        label-for="public"
      >
        <b-form-checkbox
          id="public"
          v-model="currContainer.public"
          name="public"
          value="true"
          unchecked-value="false"
        />
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
import { Container } from '@/entities/Container';
import { containerStore } from '@/store';

  @Component
export default class EditContainerModal extends Formatters {
    @Prop() private editContainer! : Container;

    currContainer: Container = {} as Container;

    mounted() {
      this.currContainer = this.editContainer;
    }

    /**
     * First check if form has been filled in correctly. Then check if we are adding an object or
     * not if yes then make a Storage with the gathered data and emit this storage to the parent
     * else make sure the storage we were editing gets updated correctly.
     */
    save(): void {
      if (this.nameState === null || !this.nameState) {
        this.currContainer = {} as Container;
      } else if (Object.keys(this.editContainer).length === 0) {
        containerStore.addContainer(this.currContainer);
      } else {
        containerStore.updateContainer(this.currContainer);
      }

      this.$bvModal.hide('edit-container');
    }

    // Check state of name
    get nameState(): boolean | null {
      return this.currContainer.name === null ? null : this.currContainer.name.length > 0;
    }

    // Return appropriate validating message for name
    get invalidName(): string {
      if (!this.nameState) {
        return this.$t('editContainerModal.name invalid').toString();
      }

      return '';
    }

    @Watch('editContainer')
    onEditContainerChange(value: Container, old: Container) : void {
      if (Object.keys(value).length > 0) {
        this.currContainer.name = value.name;
      } else {
        this.currContainer.name = '';
      }
    }
}
</script>

<style lang="scss" scoped>
.form-row {
  margin: 0.75rem 0;
}
</style>
