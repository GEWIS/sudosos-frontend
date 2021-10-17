<template>
  <b-modal
    id="edit-container"
    :ok-title="$t('containerEditModal.save')"
    :cancel-title="$t('containerEditModal.cancel')"
    :title="Object.keys(editContainer).length > 0 ?
    $t('containerEditModal.edit container') :
    $t('containerEditModal.add container')"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">
      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('containerEditModal.added on')}}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ formatDateTime(editContainer.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('containerEditModal.added by')}}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ editContainer.owner.name }}
        </b-col>
      </b-form-row>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('containerEditModal.Name')"
        label-align="left"
        label-for="name"
        :state="nameState"
        :invalid-feedback="invalidName"
      >
        <b-form-input
          id="name"
          name="name"
          type="text"
          v-model="containerName"
          :state="nameState"
        />
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('containerEditModal.Public')"
        label-align="left"
        label-for="public"
      >
        <b-form-checkbox
          id="public"
          v-model="containerPublic"
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
      >{{ $t('containerEditModal.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="save">
        {{ $t('containerEditModal.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import Formatters from '@/mixins/Formatters';
import { Container } from '@/entities/Container';
import ContainerModule from '@/store/modules/containers';

  @Component
export default class ContainerEditModal extends Formatters {
    @Prop() private editContainer! : Container;

    private containerState = getModule(ContainerModule);

    containerName: string | null = null;

    containerPublic: boolean = false;

    beforeMount() {
      if (Object.keys(this.editContainer).length > 0) {
        this.containerName = this.editContainer.name;
        this.containerPublic = this.editContainer.public as boolean;
      }
    }

    /**
     * First check if form has been filled in correctly. Then check if we are adding an object or
     * not if yes then make a Storage with the gathered data and emit this storage to the parent
     * else make sure the storage we were editing gets updated correctly.
     */
    save(): void {
      if (this.nameState === null || !this.nameState) {
        this.containerName = null;
        this.containerPublic = false;
      } else if (Object.keys(this.editContainer).length === 0) {
        this.containerState.addContainer({
          name: this.containerName,
          public: this.containerPublic,
        });
      } else {
        const updatedContainer = this.editContainer;
        updatedContainer.name = this.containerName as string;
        updatedContainer.public = this.containerPublic;

        this.containerState.updateContainer(updatedContainer);
      }

      this.$bvModal.hide('edit-container');
    }

    // Check state of name
    get nameState(): boolean | null {
      return this.containerName === null ? null : this.containerName.length > 0;
    }

    // Return appropriate validating message for name
    get invalidName(): string {
      if (!this.nameState) {
        return this.$t('containerEditModal.name invalid').toString();
      }

      return '';
    }

    @Watch('editContainer')
    onEditContainerChange(value: Container, old: Container) : void {
      if (Object.keys(value).length > 0) {
        this.containerName = value.name;
        this.containerPublic = value.public as boolean;
      } else {
        this.containerName = null;
        this.containerPublic = false;
      }
    }
}
</script>

<style lang="scss" scoped>
.form-row {
  margin: 0.75rem 0;
}
</style>
