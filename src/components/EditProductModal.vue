<template>
  <b-modal
    id="edit-product"
    :ok-title="$t('editProductModal.save')"
    :cancel-title="$t('editProductModal.cancel')"
    :title="editProduct ? $t('editProductModal.edit product') : $t('editProductModal.add product')"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">
      <b-form-row v-if="editProduct">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editProductModal.added on')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ formatDateTime(editProduct.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="editProduct">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editProductModal.added by')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ editProduct.ownerId }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="editProduct">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editProductModal.container')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ editProduct.ownerId }}
        </b-col>
      </b-form-row>


      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Name')"
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
        :label="$t('editProductModal.Category')"
        label-align="left"
        label-for="category"
        :state="categoryState"
        :invalid-feedback="invalidCategory"
      >
        <b-form-input
          id="category"
          name="category"
          type="text"
          v-model="category"
          :state="categoryState"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Price')"
        label-align="left"
        label-for="price"
        :state="priceState"
        :invalid-feedback="invalidPrice"
      >
        <b-form-input
          id="price"
          name="price"
          type="number"
          step="0.01"
          v-model="price"
          :state="priceState"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Traysize')"
        label-align="left"
        label-for="traysize"
        :state="traysizeState"
        :invalid-feedback="invalidTraysize"
      >
        <b-form-input
          id="traysize"
          name="traysize"
          type="number"
          step="1"
          v-model="traySize"
          :state="traysizeState"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Alcoholic')"
        label-align="left"
        label-for="alcoholic"
      >
        <b-form-checkbox
          id="alcoholic"
          name="alcoholic"
          v-model="alcoholic"
        >
          {{ $t('editProductModal.Alcoholic') }}
        </b-form-checkbox>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Negative')"
        label-align="left"
        label-for="negative"
      >
        <b-form-checkbox
          id="negative"
          name="negative"
          v-model="negative"
        >
          {{ $t('editProductModal.Negative') }}
        </b-form-checkbox>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Picture')"
        label-align="left"
        label-for="ad-file"
      >
        <FileFormPreview v-model="file"></FileFormPreview>
      </b-form-group>
    </div>

    <template v-slot:modal-footer="{ cancel }">
      <b-button
        variant="primary"
        class="btn-empty"
        @click="cancel()"
      >{{ $t('editProductModal.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="save">
        {{ $t('editProductModal.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">

import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';
import { Product } from '@/entities/Product';
import FileFormPreview from '@/components/FileFormPreview.vue';

  @Component({
    components: {
      FileFormPreview,
    },
  })
export default class EditProductModal extends Vue {
    @Prop() private editProduct: Product | undefined;

    name: string | null = null;

    price: number | null = null;

    traySize: number | null = null;

    category: string | null = null;

    alcoholic: boolean | null = null;

    negative: boolean | null = null;

    file: File = new File([], '');

    save(): void {
      if (this.nameState && this.categoryState && this.priceState
          && this.traysizeState && this.file) {
        const product = {
          id: '00004',
          name: this.name,
          ownerId: '001',
          price: this.price,
          picture: URL.createObjectURL(this.file),
          traySize: this.traySize,
          category: this.category,
          isAlcoholic: this.alcoholic,
          negative: this.negative,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Product;

        this.$emit('productAdded', product);
        this.$bvModal.hide('edit-product');
      }
    }

    // Check state of name
    get nameState(): boolean | null {
      return this.name === null ? null : this.name.length > 0;
    }

    // Return appropriate validating message for name
    get invalidName(): string {
      if (!this.nameState) {
        return this.$t('editProductModal.name invalid').toString();
      }

      return '';
    }

    get categoryState(): boolean | null {
      return this.category === null ? null : this.category.length > 0;
    }

    get invalidCategory() : string {
      if (!this.categoryState) {
        return this.$t('editProductModal.category invalid').toString();
      }

      return '';
    }

    get traysizeState(): boolean | null {
      return this.traySize === null ? null : this.traySize > 0;
    }

    get invalidTraysize() : string {
      if (!this.traysizeState) {
        return this.$t('editProductModal.traysize invalid').toString();
      }

      return '';
    }

    // See if a price is a price, because this is typescript we defined price as a number
    // however in normal javascript the input apparently is a string. This allows for an empty
    // input to be seen as correct. To fix this we convert the price to number (because otherwise
    // typescript will bitch) and then see if there is a . in there
    get priceState(): boolean | null {
      return this.price === null ? null : this.price >= 0 && /\d+\.\d+/.test(String(this.price));
    }

    get invalidPrice() : string {
      if (!this.priceState) {
        return this.$t('editProductModal.price invalid').toString();
      }

      return '';
    }
}
</script>

<style lang="scss" scoped>
.form-row {
  margin: 0.75rem 0;
}
</style>
