<template>
  <b-modal
    id="edit-vatgroup"
    :ok-title="$t('c_vatGroupEditModal.save')"
    :cancel-title="$t('c_vatGroupEditModal.cancel')"
    :title="modalTitle"
    v-on:shown="setVatGroup"
    size="lg"
    hide-header-close
    centered>
    <div id="edit-container-input">

      <!--  If a product is being editted we show some extra info  -->
      <b-form-row v-if="Object.keys(editProduct).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('c_productEditModal.added on') }}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ formatDateTime(editProduct.createdAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editProduct).length > 0 && 'updatedAt' in editProduct">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('c_productEditModal.updated on') }}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ formatDateTime(editProduct.updatedAt, true) }}
        </b-col>
      </b-form-row>

      <b-form-row v-if="Object.keys(editProduct).length > 0">
        <b-col cols="12" sm="3">
          <span class="font-weight-bold">{{ $t('c_productEditModal.added by') }}</span>
        </b-col>
        <b-col cols="12" sm="9">
          {{ editProduct.owner.name }}
        </b-col>
      </b-form-row>

      <!--  If a product is being added to a container the user can pick an existing  -->
      <!--  product from here to add it    -->
      <div v-if="Object.keys(container).length > 0
        && Object.keys(editProduct).length === 0
        && products.length > 0">
        <h6>{{ $t('c_productEditModal.Add existing') }}</h6>

        <b-form-group
          label-cols="12"
          label-cols-sm="3"
          :label="$t('c_productEditModal.Existing products')"
          label-align="left"
          label-for="select"
        >
          <v-select
            :options="products"
            :getOptionLabel="option => option.name"
            v-model="selectedProduct"
          >
            <template v-slot:selected-option="product">
              <img :src="`/static/products/${product.image}`" alt="product image">
              {{ product.name }}
            </template>
            <template v-slot:option="product">
              <img :src="`/static/products/${product.image}`" alt="product image">
              {{ product.name }}
            </template>
          </v-select>
        </b-form-group>

        <hr class="my-4">

        <h6>{{ addNewTitle }}</h6>

      </div>

      <!--   This is to form for adding a new product or editting an existing one   -->
      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.Name')"
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
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.Category')"
        label-align="left"
        label-for="product-category"
        :state="categoryState"
        :invalid-feedback="invalidProductCategory"
      >
        <b-form-select
          id="product-category"
          name="product-category"
          value-field="text"
          v-model="category"
          :disabled="selectedProduct !== null"
          :options="productCategories"
          :state="categoryState"
          @change="onCategoryChange"
        >
          <template #first>
            <b-form-select-option value="null" disabled>
              {{ $t('c_productEditModal.Please select') }}
            </b-form-select-option>
          </template>
        </b-form-select>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.VAT')"
        label-align="left"
        label-for="name">
        <b-form-select v-model="vatGroup" :options="vatGroups"
                       :disabled="selectedProduct !== null" @change="setVatOverride">
        </b-form-select>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.Alcohol Percentage')"
        label-align="left"
        label-for="alcohol"
        v-if="category === 'Alcoholic'"
      >
        <b-form-input
          id="alcohol"
          name="alcohol"
          type="number"
          inputmode="decimal"
          step="0.01"
          v-model="alcoholPercentage"
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.Price')"
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
          :disabled="selectedProduct !== null"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_productEditModal.Image')"
        label-align="left"
        label-for="ad-file"
        v-if="selectedProduct === null"
        :state="pictureState"
        :invalid-feedback="invalidPicture"
      >
        <FileFormPreview
          v-model="file"
          :img="img.length > 0 ? `/static/products/${img}` : undefined"
          :disabled="selectedProduct !== null"
          :state="pictureState"
        ></FileFormPreview>
      </b-form-group>

      <b-form-group
        v-if="Object.keys(editProduct).length === 0"
        label-cols="12"
        label-cols-sm="3"
        :label="$t('c_containerEditModal.owner')"
        label-align="left"
        label-for="name">
        <b-form-select v-model="productOwnerId"
                       :options="organsList"
                       :disabled="selectedProduct !== null">
        </b-form-select>
      </b-form-group>
    </div>

    <template v-slot:modal-footer="{ }">
      <b-button
        v-show="Object.keys(container).length > 0 && Object.keys(editProduct).length > 0"
        variant="primary"
        class="btn-primary mr-auto"
        v-on:click="deleteProduct"
      >{{ $t('c_productEditModal.Delete from container') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-empty"
        @click="cancelAdding"
      >{{ $t('c_productEditModal.cancel') }}
      </b-button>
      <b-button
        variant="primary"
        class="btn-primary"
        @click="save">
        {{ $t('c_productEditModal.save') }}
      </b-button>
    </template>
  </b-modal>
</template>

<script lang="ts">
import {
  Component, Prop, Watch,
} from 'vue-property-decorator';
import {
  CreateProductRequest, Product, UpdateProductRequest,
} from '@/entities/Product';
import FileFormPreview from '@/components/FileFormPreview.vue';
import Formatters from '@/mixins/Formatters';
import { VatGroup } from '@/entities/VatGroup';

@Component({
  components: {
    FileFormPreview,
  },
})
export default class VatGroupEditModal extends Formatters {
  @Prop() private editVatGroup!: VatGroup;

  name: string | null = null;

  deleted: boolean | null = null;

  hidden: boolean | null = null;

  percentage: number | null = null;

  async beforeMount() {
    this.userState.fetchSelf();
  }

  get vatGroups() {
    return this.vatGroupState.vatGroups;
  }

  setVatGroup() {
    if (Object.keys(this.editVatGroup).length > 0) {
      this.setVatGroupProperties(this.editVatGroup);
    } else {
      this.setVatGroupProperties();
    }
  }

  /**
   * Method that saves the product the user wants to add. If a product is being added
   * added directly to a container this is taken into account and the corresponding
   * API calls are made. If a product does not have all needed info set the user will
   * be notified of this.
   */
  async save(): Promise<void> {
    // First check if we are adding a product to a container directly
    if (Object.keys(this.container).length > 0) {
      // If a product is selected we are adding that to the container meaning we do not
      // also have to create a new product
      if (this.selectedProduct !== null) {
        await this.containerState.addProduct({
          container: this.container,
          product: this.selectedProduct as any,
        });
        this.setProductProperties();
        this.$bvModal.hide('edit-product');
        // Check if a new product is being added and if all the the inputs are correctly
        // set. If that is the case add the product first and then add it to the container
        // else make sure the user is shown what still needs to be inputted.
      } else if (this.nameState && this.categoryState && this.priceState && this.pictureState) {
        // Construct the new product property
        const product = this.constructProduct();

        // Check if a product is being added or being editted
        if (Object.keys(this.editProduct).length > 0) {
          const update = product as UpdateProductRequest;
          await this.productState.updateProduct({ product: update, image: this.file });
        } else {
          delete (product as any).owner;
          await this.containerState.addProduct({
            container: this.container,
            product: product as CreateProductRequest,
            file: this.file,
          });
        }
        this.$bvModal.hide('edit-product');
      } else {
        this.setInvalidStates();
      }
      // Else just add the product normally
    } else if (this.nameState && this.categoryState && this.priceState && this.pictureState) {
      // Construct the new product property
      const product = this.constructProduct();

      // Check if a product is being added or being edited
      if (Object.keys(this.editProduct).length > 0) {
        await this.productState.updateProduct({
          product: product as UpdateProductRequest, image: this.file,
        });
      } else {
        await this.productState.addProduct({ product: product as any, image: this.file });
      }
      this.setProductProperties();
      this.$bvModal.hide('edit-product');
    } else {
      this.setInvalidStates();
    }
  }

  onCategoryChange() {
    if (!this.overrideVat) {
      if (this.category === 'Alcoholic') this.vatGroup = this.vatGroups.find((group) => group.text === '21').value;
      else this.vatGroup = this.vatGroups.find((group) => group.text === '9').value;
    }
  }

  deleteProduct() {
    const product = this.constructProduct();

    this.containerState.removeProduct({
      container: this.container,
      product: product as UpdateProductRequest,
    });
    this.$bvModal.hide('edit-product');
  }

  /**
   * If the user cancels the adding we want to make sure all the inputs a reset.
   */
  cancelAdding() {
    this.setProductProperties();
    this.overrideVat = false;
    this.$bvModal.hide('edit-product');
  }

  /**
   * Makes a product object based on the set inputs and returns it.
   */
  constructProduct(): UpdateProductRequest | CreateProductRequest {
    const product = {
      id: Object.keys(this.editProduct).length > 0 ? this.editProduct.id : null,
      name: this.name,
      ownerId: this.productOwnerId,
      priceInclVat: {
        amount: this.price === null ? 0 : Math.round(this.price * 100),
        currency: 'EUR',
        precision: 2,
      },
      category: this.productCategories.find(
        (cat) => cat.name === this.category,
      )?.id,
      alcoholPercentage: this.alcoholPercentage === null ? 0 : Number(this.alcoholPercentage),
      vat: this.vatGroup,
    };

    if (Object.keys(this.editProduct).length <= 0) {
      delete product.id;
    } else {
      delete product.ownerId;
    }

    return product;
  }

  /**
   * Set or reset all the inputs for a product
   */
  setVatGroupProperties(vatGroup: VatGroup | null = null) {
    if (vatGroup === null) {
      this.name = null;
      this.deleted = false;
      this.hidden = false;
      this.percentage = null;
    } else {
      this.name = vatGroup.name;
      this.deleted = vatGroup.deleted;
      this.hidden = vatGroup.hidden;
      this.percentage = vatGroup.percentage;
    }
  }

  /**
   * If the user wants to save a product whilst some of the input states are invalid
   * we want to make sure that the invalid input messages for the invalid inputs
   * are being displayed. This method checks which messages need to be displayed and
   * updates those inputs accordingly.
   */
  setInvalidStates() {
    if (!this.nameState) {
      this.name = '';
    }

    if (!this.categoryState) {
      this.category = '';
    }

    if (!this.priceState) {
      this.price = NaN;
    }

    if (!this.pictureState) {
      this.file = new File([], '');
    }
  }

  /**
   * Below are all the input box state and invalid message computed properties.
   * These check whether the properties have been correctly filled in and display
   * an error message if not.
   */

  // Check if name has the correct value
  get nameState() {
    return this.name === null ? null : this.name.length > 0;
  }

  // Return appropriate validating message for name
  get invalidName() {
    if (!this.nameState && this.nameState !== null) {
      return this.$t('c_productEditModal.name invalid').toString();
    }

    return '';
  }

  // Check if category has the correct value
  get categoryState() {
    return this.category === null ? null : this.category.length > 0;
  }

  // Return appropriate validating message for category
  get invalidProductCategory() {
    if (!this.categoryState && this.categoryState !== null) {
      return this.$t('c_productEditModal.category invalid').toString();
    }

    return '';
  }

  // Check if price has the correct value
  get priceState() {
    return this.price === null ? null
      : Number(this.price) >= 0 && String(this.price).length > 0;
  }

  // Return appropriate validating message for price
  get invalidPrice() {
    if (!this.priceState && this.priceState !== null) {
      return this.$t('c_productEditModal.price invalid').toString();
    }

    return '';
  }

  // Check if file has the correct value
  get pictureState() {
    if (this.img.length === 0) {
      if (this.file === null) {
        return null;
      }
      return this.file.size > 0;
    }

    return true;
  }

  // Return appropriate validating message for picture
  get invalidPicture() {
    if (!this.pictureState && this.pictureState !== null) {
      return this.$t('c_productEditModal.picture invalid').toString();
    }

    return '';
  }

  /**
   * Method that sets the modal title based on adding or editting a product
   *
   * @return {string}: The title that will be displayed
   */
  get modalTitle() {
    // Check if we are editting a product
    if (Object.keys(this.editProduct).length > 0) {
      return this.$t('c_productEditModal.edit product').toString();
    }
    return this.$t('c_productEditModal.add product').toString();
  }

  /**
   * If a product is being added to a container directly show an different title
   * for clarification
   *
   * @return {string}: The title that will be displayed
   */
  get addNewTitle() {
    if (this.selectedProduct !== null) {
      return this.$t('c_productEditModal.Product details').toString();
    }

    return this.$t('c_productEditModal.Add new').toString();
  }

  /**
   * If an already existing product is selected we want to show some details about
   * it in the boxes that are normally used for inputting a product. To set the details
   * we watch the selectedProduct deep (all of it's properties) and update the input box
   * values once a product is selected.
   *
   * @param {Product | null} value
   * @param {Product | null} old
   */
  @Watch('selectedProduct', { deep: true })
  onSelectedProductChange(value: Product | null, old: Product | null) {
    if (value === null) {
      this.setProductProperties();
    } else {
      this.setProductProperties(value);
    }
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
