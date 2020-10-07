<template>
  <b-modal
    id="edit-product"
    :ok-title="$t('editProductModal.save')"
    :cancel-title="$t('editProductModal.cancel')"
    :title="modalTitle"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">
      <b-form-row v-if="Object.keys(editProduct).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editProductModal.added on')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ formatDateTime(editProduct.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editProduct).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('editProductModal.added by')}}</span>
        </b-col>
        <b-col cols="12" sm="3">
          {{ editProduct.ownerId }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editProduct).length > 0">
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
        :label="$t('editProductModal.Add existing product')"
        label-align="left"
        label-for="name"
        :state="nameState"
        :invalid-feedback="invalidName"
        v-if="container"
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
          inputmode="decimal"
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
          inputmode="decimal"
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
          switch
        />
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
          switch
        />
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Picture')"
        label-align="left"
        label-for="ad-file"
      >
        <FileFormPreview v-model="file" :img="img.length > 0 ? img : undefined"></FileFormPreview>
      </b-form-group>
    </div>

    <div class="delete-button" v-if="Object.keys(editProduct).length > 0">
      <b-button
        variant="primary"
        class="btn-primary"
        v-on:click="$emit('productDeleted', editProduct)"
      >{{ $t('editProductModal.Delete product') }}
      </b-button>
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
  Component, Prop, Watch,
} from 'vue-property-decorator';
import { Product } from '@/entities/Product';
import FileFormPreview from '@/components/FileFormPreview.vue';
import Formatters from '@/mixins/Formatters';

  @Component({
    components: {
      FileFormPreview,
    },
  })
export default class EditProductModal extends Formatters {
    @Prop() private editProduct!: Product;

    @Prop() private container!: Product;

    name: string | null = null;

    price: number | null = null;

    traySize: number | null = null;

    category: string | null = null;

    alcoholic: boolean | null = null;

    negative: boolean | null = null;

    file: File = new File([], '');

    img: string = '';

    save(): void {
      if (this.nameState && this.categoryState && this.priceState
          && this.traysizeState && this.file) {
        if (Object.keys(this.editProduct).length === 0) {
          const product = {
            id: `00004_${this.name}`,
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
        } else {
          const product = this.editProduct;
          product.name = String(this.name);
          product.price = Number(this.price);
          product.picture = URL.createObjectURL(this.file) || this.img;
          product.traySize = Number(this.traySize);
          product.category = String(this.category);
          product.isAlcoholic = Boolean(this.alcoholic);
          product.negative = Boolean(this.negative);
          product.updatedAt = new Date();

          this.$emit('productEdited', product);
        }
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

    get priceState(): boolean | null {
      return this.price === null ? null : Number(this.price) >= 0 && String(this.price).length > 0;
    }

    get invalidPrice() : string {
      if (!this.priceState) {
        return this.$t('editProductModal.price invalid').toString();
      }

      return '';
    }

    get modalTitle() {
      const title: string = this.container ? ' container' : '';

      if (Object.keys(this.editProduct).length > 0) {
        return this.$t(`editProductModal.edit product${title}`);
      }
      return this.$t(`editProductModal.add product${title}`);
    }

    @Watch('editProduct')
    onEditProductChange(value: Product, old: Product): void {
      if (Object.keys(value).length > 0) {
        this.name = String(value.name);
        this.price = Number(value.price);
        this.category = String(value.category);
        this.traySize = Number(value.traySize);
        this.alcoholic = Boolean(value.isAlcoholic);
        this.negative = Boolean(value.negative);
        this.img = String(value.picture);
      } else {
        this.name = null;
        this.price = null;
        this.category = null;
        this.traySize = null;
        this.alcoholic = null;
        this.negative = null;
        this.img = '';
      }
    }
}
</script>

<style lang="scss" scoped>
  .delete-button {
    padding-top: 1.5rem;
    padding-right: 0.75px;
  }

.form-row {
  margin: 0.75rem 0;
}
</style>
