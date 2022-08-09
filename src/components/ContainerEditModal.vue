<template>
  <b-modal
    id="edit-container"
    :ok-title="$t('c_containerEditModal.save')"
    :cancel-title="$t('c_containerEditModal.cancel')"
    :title="Object.keys(editContainer).length > 0 ?
    $t('c_containerEditModal.edit container') :
    $t('c_containerEditModal.add container')"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">
      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('c_containerEditModal.added on')}}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ formatDateTime(editContainer.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editContainer).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('c_containerEditModal.added by')}}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ editContainer.owner.name }}
        </b-col>
      </b-form-row>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_containerEditModal.Name')"
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
        v-if="Object.keys(editContainer).length === 0"
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_containerEditModal.owner')"
        label-align="left"
        label-for="name">
        <b-form-select v-model="containerOwnerId" :options="organsList"></b-form-select>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_containerEditModal.Public')"
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
      >{{ $t('c_containerEditModal.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="save">
        {{ $t('c_containerEditModal.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import Formatters from '@/mixins/Formatters';
import { Container, CreateContainerRequest } from '@/entities/Container';

import { getContainerProducts, patchContainer, postContainer } from '@/api/containers';
import { Product } from '@/entities/Product';
import { User } from '@/entities/User';
import { getUsers } from '@/api/users';

  @Component
export default class ContainerEditModal extends Formatters {
    @Prop() private editContainer! : Container;

    containerName: string | null = null;

    containerPublic: boolean = false;

    containerOwnerId: number = null;

    containerProducts: Product[] = [];

    organsList: {value: number, text: string}[] = [];

    async beforeMount() {
      this.organsList = this.userState.organsList;
      // TODO: Fix to actual current value
      this.containerOwnerId = this.organsList[0].value;
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
      if (this.nameState === null) return;
      const updatedContainer = {} as CreateContainerRequest;
      updatedContainer.name = this.containerName as string;
      updatedContainer.public = !!this.containerPublic;
      updatedContainer.products = this.containerProducts.map((p) => p.id);
      updatedContainer.ownerId = this.containerOwnerId;

      if (this.editContainer.id) {
        patchContainer(this.editContainer.id, updatedContainer).then((data) => {
          this.$emit('updatedContainer', data);
        });
      } else {
        postContainer(updatedContainer).then((data) => {
          this.$emit('addedContainer', data);
        });
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
        return this.$t('c_containerEditModal.name invalid').toString();
      }

      return '';
    }

    @Watch('editContainer')
    async onEditContainerChange(value: Container, old: Container) : Promise<void> {
      if (Object.keys(value).length > 0) {
        this.containerProducts = ((await getContainerProducts(this.editContainer.id) as any)
          .records).map((p: Product) => p.id);
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
