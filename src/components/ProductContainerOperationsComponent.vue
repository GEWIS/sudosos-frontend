<template>
  <Dialog header="Add Product"
          :draggable="false"
          modal
          ref="dialog"
          @show="addListenerOnDialogueOverlay(dialog)"
  >
    <form @submit="handleSubmit">
      <div class="flex gap-5">
        <p class="prop">Add existing product</p>
        <Dropdown
            :placeholder="$t('c_ContainerAssign.Select product')"
            :options="products"
            optionLabel="name"
            v-bind="selectProductAttrs"
            v-model="selectProduct"
            :filter="true"
            editable
        />
      </div>
      <hr>
      <div class="flex gap-5 overflow-hidden">
        <!-- Row for Picture -->
        <div class="flex flex-column align-items-center gap-3">
          <div class="picture-container p-3">
<!--            <img class="product-image" :src="productImageUrl">-->
                    <img class="product-image" :src="getProductImageSrc(displayProduct)" :alt="displayProduct.name">
          </div>
          <div class="col-12 md:col-10">
            <FileUpload id="img" mode="basic" name="productImg" accept="image/*"/>
<!--            <FileUpload id="img" mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)"/>-->
          </div>
        </div>

        <div class="flex flex-column w-30rem justify-content-between pr-5 py-5 gap-3">
          <div class="flex flex-row justify-content-between">
            <label for="name">{{ $t('c_productInfoModal.Name') }}</label>
            <div>
              <InputText id="name" class="w-18rem" v-model="name" type="text" v-bind="nameAttrs"/>
              <br>
              <span class="error-text">{{ errors.name }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="category">{{ $t('c_productInfoModal.Category') }}</label>
            <div>
              <Dropdown :placeholder="$t('c_productEditModal.Please select')" :options="categories" optionLabel="name"
                        v-model="category" class="w-18rem" id="category" v-bind="categoryAttrs"/>
              <br>
              <span class="error-text">{{ errors.category }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="vat">{{ $t('c_productEditModal.VAT') }}</label>
            <div>
              <Dropdown :placeholder="$t('c_productEditModal.Please select VAT')" :options="vatGroups"
                        optionLabel="percentage" class="w-18rem" v-model="vat" v-bind="vatAttrs"/>
              <br>
              <span class="error-text">{{ errors.vatGroup }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between" v-if="category && category.name === 'Alcoholic'">
            <label for="alcohol">{{
                $t('c_productEditModal.Alcohol Percentage')
              }}</label>
            <div class="flex flex-column flex-end">
              <InputNumber id="alcohol" class="w-18rem" v-model="alcoholPercentage" v-bind="alcoholPercentageAttrs" :max-fraction-digits="2"/>
              <br>
              <span class="error-text">{{ errors.alcoholPercentage }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="price" >{{ $t('c_productEditModal.Price') }}</label>
            <div class="flex flex-column flex-end">
              <InputNumber id="price" class="w-18rem" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2"/>
              <br>
              <span class="error-text">{{ errors.price }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="owner" >{{ $t('c_POSCreate.Owner') }}</label>
            <div class="flex flex-column flex-end">
              <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                        v-model="owner" class="w-18rem" id="owner" v-bind="ownerAttrs"/>
              <br>
              <span class="error-text">{{ errors.owner }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <Button type="submit" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
// TODO merge the ProductDialogComponent and the ProductCreateComponent adn the ContainerAssignProductDialog into a signle component here.
import { computed, type ComputedRef, onBeforeMount, type PropType, type Ref, ref } from "vue";
import type {
  BaseUserResponse,
  ContainerWithProductsResponse,
  ProductCategoryResponse,
  ProductResponse,
  VatGroupResponse
} from "@sudosos/sudosos-client";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { useProductStore } from "@/stores/product.store";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
const { t } = useI18n();
import { useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { getProductImageSrc } from "@/utils/imageUtils";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import FileUpload from "primevue/fileupload";

const dialog: Ref<null | any> = ref(null);
const productStore = useProductStore();
const products = computed(() => Object.values(productStore.getProducts).sort((a, b) => a.name.localeCompare(b.name)));
const displayProduct: ComputedRef<ProductResponse> = computed(() => selectProduct as any as ProductResponse);

const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const organsList: Ref<BaseUserResponse[]> = ref([]);

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse>,
  }
});

const schema = toTypedSchema(
    yup.object({
      productSelect: yup.mixed<ProductResponse>()
          .test({
            name: 'unique-product',
            message: () => t("c_ContainerAssign.Product selection error"),
            test: (product: ProductResponse | undefined) =>
                product == null
          })
          .required(),
      name: yup.string().required(),
      category: yup.mixed<ProductCategoryResponse>().required(),
      vatGroup: yup.mixed<VatGroupResponse>().required(),
      alcoholPercentage: yup.number(),
      price: yup.number().required(),
      owner: yup.mixed<BaseUserResponse>().required()
    })
);

const { defineField, resetForm, errors, handleSubmit } = useForm({
  validationSchema: schema,
});

const [selectProduct, selectProductAttrs] = defineField('productSelect');
const [name, nameAttrs] = defineField('name');
const [category, categoryAttrs] = defineField('category');
const [vat, vatAttrs] = defineField('vatGroup');
const [price, priceAttrs] = defineField('price');
const [owner, ownerAttrs] = defineField('owner');
const [alcoholPercentage, alcoholPercentageAttrs] = defineField('alcoholPercentage');

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
});

</script>

<style scoped lang="scss">
.alt-dialog-content {
  padding: 0 !important;
}

.picture-container {
  width: 21rem; /* 336px if 1rem = 16px */
  height: 21rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff; /* Ensuring background is white */
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  width: auto; /* New line: Ensures width is auto-adjusted */
  height: 100%; /* New line: Ensures height is auto-adjusted */
  object-fit: cover; /* Changes from contain to cover to ensure full square area is used */
}
</style>
