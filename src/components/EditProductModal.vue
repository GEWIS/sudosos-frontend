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
          {{ editProduct.owner.name }}
        </b-col>
      </b-form-row>

      <div v-if="container && Object.keys(editProduct).length === 0">

      <h6>{{ $t('editProductModal.Add existing') }}</h6>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Add existing product')"
        label-align="left"
        label-for="select"
      >
        <v-select :options="products"
                  :getOptionLabel="option => option.name"
                  v-model="selectedProduct"
        >
          <template v-slot:selected-option="product">
            <img :src="product.picture" alt="product image">
            {{ product.name }}
          </template>
          <template v-slot:option="product">
            <img :src="product.picture" alt="product image">
            {{ product.name }}
          </template>
        </v-select>
      </b-form-group>

      <hr class="my-4">

      <h6>{{ $t('editProductModal.Add new') }}</h6>

      </div>

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
          v-model="currProduct.name"
          :state="nameState"
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Category')"
        label-align="left"
        label-for="category"
      >
        <b-form-input
          id="category"
          name="category"
          type="text"
          v-model="currProduct.category"
          :disabled="selectedProduct !== null"
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
          v-model="currProduct.price"
          :state="priceState"
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Alcohol Percentage')"
        label-align="left"
        label-for="alcohol"
      >
        <b-form-input
          id="alcohol"
          name="alcohol"
          type="number"
          inputmode="decimal"
          step="0.01"
          v-model="currProduct.alcoholPercentage"
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('editProductModal.Picture')"
        label-align="left"
        label-for="ad-file"
      >
        <FileFormPreview
          v-model="file"
          :img="img.length > 0 ? img : undefined"
          :disabled="selectedProduct !== null"
        ></FileFormPreview>
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
  Component, Prop,
} from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { Product } from '@/entities/Product';
import FileFormPreview from '@/components/FileFormPreview.vue';
import Formatters from '@/mixins/Formatters';
import { Container } from '@/entities/Container';
import ProductsModule from '@/store/modules/products';
import { BaseUser } from '@/entities/User';
import ContainerModule from '@/store/modules/containers';
import UserModule from '@/store/modules/user';

  @Component({
    components: {
      FileFormPreview,
    },
  })
export default class EditProductModal extends Formatters {
    @Prop() private editProduct!: Product;

    @Prop() private container!: Container;

    private productState = getModule(ProductsModule);

    private containerState = getModule(ContainerModule);

    private userState = getModule(UserModule);

    currProduct: Product = {} as Product;

    file: File = new File([], '');

    img: string = '';

    products: Product[] = [];

    selectedProduct: Product | null = null;

    beforeMount() {
      this.productState.fetchProducts();
      this.products = this.productState.products as Product[];
      this.currProduct = this.editProduct;
    }

    save(): void {
      if (this.nameState && this.priceState && this.file) {
        if (Object.keys(this.editProduct).length === 0) {
          this.currProduct.owner = {
            id: this.userState.user.id,
            name: this.userState.user.name,
          } as BaseUser;

          this.currProduct.picture = URL.createObjectURL(this.file);

          if (this.container) {
            this.containerState.addProduct(this.container, this.currProduct);
          } else {
            this.productState.addProduct(this.currProduct);
          }
        } else {
          this.currProduct.picture = URL.createObjectURL(this.file);

          this.productState.updateProduct(this.currProduct);
        }
        this.$bvModal.hide('edit-product');
      } else if (this.selectedProduct !== null) {
        this.containerState.addProduct(this.container, this.selectedProduct);
        this.selectedProduct = null;
        this.$bvModal.hide('edit-product');
      }
    }

    // Check state of name
    nameState(): boolean | null {
      return this.currProduct.name === null ? null : this.currProduct.name.length > 0;
    }

    // Return appropriate validating message for name
    invalidName(): string {
      if (!this.nameState) {
        return this.$t('editProductModal.name invalid').toString();
      }

      return '';
    }

    priceState(): boolean | null {
      return this.currProduct.price === null ? null
        : Number(this.currProduct.price) >= 0 && String(this.currProduct.price).length > 0;
    }

    invalidPrice() : string {
      if (!this.priceState) {
        return this.$t('editProductModal.price invalid').toString();
      }

      return '';
    }

    modalTitle() {
      const title: string = this.container ? ' container' : '';

      if (Object.keys(this.editProduct).length > 0) {
        return this.$t(`editProductModal.edit product${title}`);
      }
      return this.$t(`editProductModal.add product${title}`);
    }
}
</script>

<style lang="scss" scoped>

.v-select {
  img {
    max-height: 20px;
    max-width: 20px;
    width: auto;
    height: auto;
    margin-right: 1rem;
  }
}

.delete-button {
    padding-top: 1.5rem;
    padding-right: 0.75px;
  }

.form-row {
  margin: 0.75rem 0;
}
</style>
