<template>
  <Dialog v-model:visible="visible"
          header="Add Product"
          :draggable="false"
          modal
          ref="dialog"
          @show="addListenerOnDialogueOverlay(dialog)"
  >
    <div @submit="handleSubmit" class="flex flex-column gap-3">
      <div class="flex gap-5 justify-content-end">
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
      <div class="flex gap-5 align-items-center overflow-hidden">
        <div class="flex flex-column align-items-center gap-3">
          <div class="picture-container p-3" @click="onImgUpload">
            <img v-if="imageSrc" class="product-image" :src="imageSrc" :alt="displayProduct.name">
            <div v-else class="upload-container">
              <i class="fa fa-upload"></i>
              <p>Upload image here</p>
            </div>
            <input type="file" id="img" name="productImg" accept="image/*" @change="onImgUpload" style="display: none"/>
          </div>
        </div>

        <div class="flex flex-column w-30rem justify-content-between pr-5 py-5 gap-3">
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="name">{{ $t('c_productInfoModal.Name') }}</label>
            <div class="relative">
              <InputText id="name" class="w-18rem" v-model="name" type="text" v-bind="nameAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.name }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="category">{{ $t('c_productInfoModal.Category') }}</label>
            <div class="relative">
              <Dropdown :placeholder="$t('c_productEditModal.Please select')" :options="categories" optionLabel="name"
                        v-model="category" class="w-18rem" id="category" v-bind="categoryAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.category }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="vat">{{ $t('c_productEditModal.VAT') }}</label>
            <div class="relative">
              <Dropdown :placeholder="$t('c_productEditModal.Please select VAT')" :options="vatGroups"
                        optionLabel="percentage" class="w-18rem" v-model="vat" v-bind="vatAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.vatGroup }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="alcohol">{{
                $t('c_productEditModal.Alcohol Percentage')
              }}</label>
            <div class="flex flex-column flex-end relative">
              <InputNumber id="alcohol" class="w-18rem" v-model="alcoholPercentage" v-bind="alcoholPercentageAttrs"
                           :max-fraction-digits="2" :disabled="!edit || (!category || category.name !== 'Alcoholic')"/>
              <br>
              <span class="error-text">{{ errors.alcoholPercentage }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="price">{{ $t('c_productEditModal.Price') }}</label>
            <div class="flex flex-column flex-end relative">
              <InputNumber id="price" class="w-18rem" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2"
                           :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.price }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="owner">{{ $t('c_POSCreate.Owner') }}</label>
            <div class="flex flex-column flex-end relative">
              <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                        v-model="owner" class="w-18rem" id="owner" v-bind="ownerAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.owner }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-content-end" v-if="state.addToContainer">
        <Button type="submit" class="save-button" @click="handleProductAdd"> Add to container</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
// TODO merge the ProductDialogComponent and the ProductCreateComponent adn the ContainerAssignProductDialog into a signle component here.
import { computed, type ComputedRef, onBeforeMount, type PropType, type Ref, ref, watch } from "vue";
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
import { useContainerStore } from "@/stores/container.store";

const dialog: Ref<null | any> = ref(null);
const productStore = useProductStore();
const containerStore = useContainerStore();
const products = computed(() => Object.values(productStore.getProducts).sort((a, b) => a.name.localeCompare(b.name)));
const displayProduct: ComputedRef<ProductResponse> = computed(() => selectProduct as any as ProductResponse);

const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const organsList: Ref<BaseUserResponse[]> = ref([]);
const edit = computed(() => selectProduct.value == null);
const visible = ref(false);

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse>,
  }
});

const state = {
  addToContainer: props.container != undefined && props.product == undefined,
  createProduct: props.container == undefined && props.product == undefined,
  displayProduct: props.container != undefined && props.product == undefined,
};

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

watch(selectProduct, () => {
  name.value = selectProduct.value?.name;
  category.value = categories.value.find((c) => c.id == selectProduct.value?.category?.id);
  vat.value = vatGroups.value.find((c) => c.id == selectProduct.value?.vat?.id);
  price.value = selectProduct.value?.priceInclVat?.amount;
  owner.value = selectProduct.value?.owner;
  alcoholPercentage.value = selectProduct.value?.alcoholPercentage;
});

const imageSrc: Ref<string> = ref(props.product ? getProductImageSrc(props.product) : '');
watch(selectProduct, () => {
  if (!selectProduct.value) return;
  imageSrc.value = getProductImageSrc(selectProduct.value as ProductResponse);
});

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
  selectProduct.value = undefined;
});

const handleProductAdd = handleSubmit(async () => {
  if (!props.container || !selectProduct.value) return;
  await containerStore.addProductToContainer(props.container, selectProduct.value as ProductResponse);
  visible.value = false;
});

</script>

<style scoped lang="scss">
.alt-dialog-content {
  padding: 0 !important;
}

.picture-container {
  width: 21rem;
  height: 21rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: 100%;
  object-fit: cover;
}

.error-text {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 100%;
}
</style>
