<template>
  <FormDialog v-model="visible"
              :form="form"
              :header="header"
              @show="openDialog()"
  >
    <template #form>
      <div class="flex flex-column gap-1">
        <ProductActionExistingProductForm
            v-if="state.addToContainer"
            v-model:select-product="selectExistingProduct"
            :products="products"/>
        <hr class="w-full opacity-50" v-if="state.addToContainer">
        <div class="flex flex-row gap-4">
          <ProductActionImageForm
              :image-src="imageSrc"
              @upload:image="onImageUpload"
              :isEditable="isProductEditable"
          />
          <div class="flex flex-column gap-3">
            <ProductActionForm
                :form="form"
                @submit:success="visible = false"
                :product-categories="categories"
                :vat-groups="vatGroups"
                :isEditable="isProductEditable"/>
            <div class="flex flex-row justify-content-end gap-1">
              <Button
                  type="button"
                  icon="pi pi-trash"
                  :label="$t('common.delete')"
                  outlined/>
            </div>
            <div>
              <!-- Row for Added on -->
              <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
                <h4 class="my-0">{{ $t("c_productContainerOperations.Added on") }}</h4>
                <p class="my-0" v-if="product">
                  {{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
              </div>

              <!-- Row for Updated on -->
              <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
                <h4 class="my-0">{{ $t("c_productContainerOperations.Updated on") }}</h4>
                <p class="my-0" v-if="product">
                  {{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>
  </FormDialog>
</template>

<script setup lang="ts">

import {
  computed,
  type ComputedRef,
  onBeforeMount,
  type PropType,
  ref,
  type Ref, watch
} from "vue";
import type {
  BaseUserResponse,
  ContainerWithProductsResponse,
  ProductCategoryResponse,
  ProductResponse,
  VatGroupResponse
} from "@sudosos/sudosos-client";
import { schemaToForm, setSubmit } from "@/utils/formUtils";
import { createProductSchema } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import ProductActionForm from "@/modules/seller/components/ProductActionForm.vue";
import { useProductStore } from "@/stores/product.store";
import { useContainerStore } from "@/stores/container.store";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useI18n } from "vue-i18n";
import ProductActionImageForm from "@/modules/seller/components/ProductActionImageForm.vue";
import ProductActionExistingProductForm from "@/modules/seller/components/ProductActionExistingProductForm.vue";
import { getProductImageSrc } from "@/utils/urlUtils";
import apiService from "@/services/ApiService";
import { formatDateTime } from "@/utils/formatterUtils";
const { t } = useI18n();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse | undefined>,
  },
});

const visible = defineModel('visible');

const form = schemaToForm(createProductSchema);

// Load Stores
const productStore = useProductStore();
const containerStore = useContainerStore();
const userStore = useUserStore();

// Deep reactivity
const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const products: ComputedRef<ProductResponse[]> = computed(() => Object.values(productStore.getAllProducts));
const organsList: ComputedRef<BaseUserResponse[]> = computed(() => userStore.organs);

// Load all product information once
onBeforeMount(async () => {

  // const alcoholic = categories.value.find((c) => c.name === 'Alcoholic');
  // if (alcoholic) {
  //   vatMap[alcoholic.id] = vatGroups.value.find((v) => v.name === 'BTW Hoog');
  //   vatMap.other = vatGroups.value.find((v) => v.name === 'BTW Laag');
  // }
});

// Handle image upload
const productImage: Ref<File | undefined> = ref();
const imageSrc = ref<string>();
function onImageUpload(image: File) {
  productImage.value = image;
  imageSrc.value = URL.createObjectURL(image);
}

const updateFieldValues = (p: ProductResponse) => {
  if (!p) return;
  const name = p.name;
  const category = categories.value.find((c) => c.id == p.category.id);
  const vat = vatGroups.value.find((c) => c.id == p.vat.id);
  const priceInclVat = p.priceInclVat.amount / 100;
  console.log(organsList.value);
  const owner = organsList.value.find((o) => o.id == p.owner.id);
  console.log(owner);
  const alcoholPercentage = p.alcoholPercentage;
  const preferred = p.preferred;
  const featured = p.featured;
  const priceList = p.priceList;
  form.context.resetForm({
    values: {
      name,
      category,
      vat,
      priceInclVat,
      owner,
      alcoholPercentage,
      preferred,
      featured,
      priceList
    }
  });

  productImage.value = undefined;
  imageSrc.value = getProductImageSrc(p);

};

// Current state / operations
const state = computed(() => {
  return {
    addToContainer: props.container != undefined && props.product == undefined,
    createProduct: props.container == undefined && props.product == undefined,
    displayProduct: props.product != undefined,
  };
});

// Generate the correct header for the Dialog
const header = computed(() => {
  if (state.value.addToContainer) return t('c_productContainerOperations.header.addProductToContainer');
  if (state.value.createProduct) return t('c_productContainerOperations.header.createProduct');
  if (state.value.displayProduct) return t('c_productContainerOperations.header.productDetails');
  return '';
});

// Handle selecting existing product
const selectExistingProduct = ref<ProductResponse | undefined>(undefined);
watch(selectExistingProduct, () => {
  if (selectExistingProduct.value) updateFieldValues(selectExistingProduct.value);
});

// We don't allow editing of dropdown products
const isProductEditable = computed(() => selectExistingProduct.value == null);

setSubmit(form, form.context.handleSubmit(async (values) => {
  // Create a new product (or add a new product to container)
  if(
      state.value.createProduct ||
      (state.value.addToContainer && selectExistingProduct.value == undefined)) {

  }

  // Add product to container
  if(state.value.addToContainer) {

  }


  //
  if(state.value.displayProduct) {

  }
}));

const openDialog = async () => {
  await productStore.fetchAllIfEmpty();
  await userStore.fetchAllOrgans(apiService);
  selectExistingProduct.value = undefined;
  if (props.product) {
    updateFieldValues(props.product);
    // vatMap.edited = true;
  }
};

// const closeDialog = () => {
//   resetForm();
//   imageSrc.value = '';
//   selectProduct.value = undefined;
//   productImage.value = undefined;
//   closeTo.value = null;
//   vatMap.edited = false;
//   emit('update:visible', false);
// };

</script>
<style scoped lang="scss">

</style>