<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<!--TODO remove ProductGridComponent, ProductDialog and product create-->
<template>
  <Dialog v-model:visible="visible"
          :header="header"
          :draggable="false"
          modal
          @update:visible="closeDialog"
          :close-on-escape="true"
          ref="dialog"
          @show="addListenerOnDialogueOverlay(dialog)"
  >
    <div @submit="handleSubmit" class="flex flex-column gap-3">
      <div class="flex gap-5 justify-content-end" v-if="state.addToContainer">
        <p class="prop">Add existing product</p>
        <Dropdown
            :placeholder="$t('c_ContainerAssign.Select product')"
            :options="dropdownProducts"
            optionLabel="name"
            v-model="selectProduct"
            :filter="true"
            class="w-15rem align-items-center"
        />
      </div>
      <hr class="w-full opacity-50" v-if="state.addToContainer">
      <div class="flex gap-5 align-items-center overflow-hidden" :class="!edit ? 'opacity-50':''">
        <div class="flex flex-column align-items-center gap-3">
          <div class="picture-container p-3">
            <img v-if="imageSrc" class="product-image" :src="imageSrc" :alt="displayProduct.name">
          </div>
          <div v-if="edit">
            <FileUpload id="img" mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)"/>
          </div>
          {{ productImage }}
        </div>

        <div class="flex flex-column w-30rem justify-content-between pr-5 py-5 gap-3">
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="name">{{ $t('c_productInfoModal.Name') }}</label>
            <div class="relative mb-3">
              <InputText id="name" class="w-18rem" v-model="name" type="text" v-bind="nameAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text-name block w15-rem" v-if="closeTo && !errors.name" @click="selectCloseTo">
                Name is close to: {{ closeTo.name }} (click to pick)</span>
              <span class="error-text">{{ errors.name }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="category">{{ $t('c_productInfoModal.Category') }}</label>
            <div class="relative mb-3">
              <Dropdown :placeholder="$t('c_productEditModal.Please select')" :options="categories" optionLabel="name"
                        v-model="category" class="w-18rem" id="category" v-bind="categoryAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.category }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="vat">{{ $t('c_productEditModal.VAT') }}</label>
            <div class="relative mb-3">
              <Dropdown :placeholder="$t('c_productEditModal.Please select VAT')" :options="vatGroups"
                        :optionLabel="(v: VatGroupResponse) => `${v.percentage}`" class="w-18rem" v-model="vat"
                        v-bind="vatAttrs" :disabled="!edit" @change="markVatEdited()"/>
              <br>
              <span class="error-text">{{ errors.vatGroup }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="alcohol">{{
                $t('c_productEditModal.Alcohol Percentage')
              }}</label>
            <div class="flex flex-column flex-end relative mb-3">
              <InputNumber id="alcohol" class="w-18rem" v-model="alcoholPercentage" v-bind="alcoholPercentageAttrs"
                           :max-fraction-digits="2" :disabled="!edit || (!category || category.name !== 'Alcoholic')"/>
              <br>
              <span class="error-text">{{ errors.alcoholPercentage }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between align-items-center">
            <label for="price">{{ $t('c_productEditModal.Price') }}</label>
            <div class="flex flex-column flex-end relative mb-3">
              <InputNumber id="price" class="w-18rem" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2"
                           :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.price }}</span>
            </div>
          </div>
          <div v-if="!state.displayProduct" class="flex flex-row justify-content-between align-items-center">
            <label for="owner">{{ $t('c_POSCreate.Owner') }}</label>
            <div class="flex flex-column flex-end relative mb-3">
              <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                        v-model="owner" class="w-18rem" id="owner" v-bind="ownerAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text">{{ errors.owner }}</span>
            </div>
          </div>

          <!-- Row for Added on -->
          <div v-if="state.displayProduct" class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Added on") }}</h4>
            <p class="my-0">{{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Updated on -->
          <div v-if="state.displayProduct" class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Updated on") }}</h4>
            <p class="my-0">{{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Added by -->
          <div v-if="state.displayProduct" class="flex flex-row justify-content-between">
            <h4 class="my-0">Owner</h4>
            <p class="my-0">{{ product.owner.firstName + ' ' + product.owner.lastName }}</p>
          </div>
        </div>
      </div>
      <div class="flex justify-content-end" v-if="state.addToContainer">
        <Button type="submit" class="save-button" @click="handleProductAdd()">Add to container</Button>
      </div>
      <div class="flex justify-content-end" v-if="state.displayProduct">
        <Button type="submit" class="save-button" @click="handleSaveProduct()">Save</Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
// TODO merge the ProductDialogComponent and the ProductCreateComponent adn the ContainerAssignProductDialog into a signle component here.
import { computed, type ComputedRef, onBeforeMount, type PropType, type Ref, ref, watch } from "vue";
import type {
  BaseUserResponse,
  ContainerWithProductsResponse, CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse, UpdateProductRequest,
  VatGroupResponse
} from "@sudosos/sudosos-client";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { useProductStore } from "@/stores/product.store";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { useI18n } from "vue-i18n";
import { getProductImageSrc } from "@/utils/imageUtils";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import { useContainerStore } from "@/stores/container.store";
import Fuse from "fuse.js";
import FileUpload from "primevue/fileupload";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { formatDateTime } from "@/utils/formatterUtils";
const { t } = useI18n();

const dialog: Ref<null | any> = ref(null);

const productStore = useProductStore();
const containerStore = useContainerStore();
const authStore = useAuthStore();

const products = ref<ProductResponse[]>([]);

const dropdownProducts = computed(() => {
  if (!props.container) return products;
  return products.value.filter((p) => !props.container.products.map((p) => p.id).includes(p.id));
});


const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const organsList: Ref<BaseUserResponse[]> = ref(authStore.organs);
const edit = computed(() => selectProduct.value == null);
const visible = ref(false);
const header = computed(() => {
  if (state.addToContainer) return 'Add product to container';
  if (state.createProduct) return 'Create product';
  if (state.displayProduct) return 'Product details';
  return '';

});

const productImage: Ref<File | undefined> = ref();
const imageSrc = ref('');

const vatMap: { [key: string | number]:any } = {
  other: undefined,
  modified: false,
};

const markVatEdited = () => {
  vatMap.edited = true;
};

const emit = defineEmits(['update:visible']);

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse|undefined>,
  },
});

const state = {
  addToContainer: props.container !== undefined && props.product === undefined,
  createProduct: props.container === undefined && props.product === undefined,
  displayProduct: props.product !== undefined,
};

const creationSchema = toTypedSchema(
    yup.object({
      name: yup.string().required(),
      category: yup.mixed<ProductCategoryResponse>().required(),
      vatGroup: yup.mixed<VatGroupResponse>().required(),
      alcoholPercentage: yup.number(),
      price: yup.number().required(),
      owner: yup.mixed<BaseUserResponse>().required()
    })
);

const { defineField, resetForm, errors, handleSubmit } = useForm({
  validationSchema: creationSchema,
});

const selectProduct = ref<ProductResponse|undefined>(undefined);
const [name, nameAttrs] = defineField('name');
const [category, categoryAttrs] = defineField('category');
const [vat, vatAttrs] = defineField('vatGroup');
const [price, priceAttrs] = defineField('price');
const [owner, ownerAttrs] = defineField('owner');
const [alcoholPercentage, alcoholPercentageAttrs] = defineField('alcoholPercentage');

const updateFieldValues = (p: ProductResponse) => {
  if (!p) return;
  name.value = p.name;
  category.value = categories.value.find((c) => c.id == p.category.id);
  vat.value = vatGroups.value.find((c) => c.id == p.vat.id);
  price.value = p.priceInclVat.amount / 100;
  owner.value = organsList.value.find((o) => o.id == p.owner.id);
  alcoholPercentage.value = p.alcoholPercentage;
  imageSrc.value = getProductImageSrc(p);
};


const displayProduct = ref(props.product);
watch(selectProduct, () => {
  if (!props.product) {
    displayProduct.value = selectProduct.value;
  }
});

watch(displayProduct, () => {
  const p = displayProduct.value as ProductResponse;
  updateFieldValues(p);
});


const closeTo = ref<ProductResponse | null>(null);

watch(name, () => {
  if (state.displayProduct) return;
  if (selectProduct.value) return;
  if (!name.value) return;

  // Create a new instance of Fuse for your products
  const fuse = new Fuse(products.value, {
    keys: ['name'],
    includeScore: true,
    threshold: 0.3
  });

  // Search for products with a similar name
  const results = fuse.search(name.value);

  // If a similar product is found, update the 'similar' value
  if (results.length > 0 && results[0].score < 0.3) {
    closeTo.value = results[0].item;
  } else {
    closeTo.value = null;
  }
});

watch(category, () => {
  if (vatMap.edited) return;

  if (!category.value || !category.value.id) return;
  const vatMapped = vatMap[category.value.id];
  if (vatMapped) vat.value = vatMapped;
  else if (vatMap.other) vat.value = vatMap.other;
});

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
  selectProduct.value = undefined;
  products.value = Object.values(productStore.getProducts);
  if (props.product) updateFieldValues(props.product);


  const alcoholic = categories.value.find((c) => c.name === 'Alcoholic');
  if (alcoholic) {
    vatMap[alcoholic.id] = vatGroups.value.find((v) => v.name === 'BTW Hoog');
    vatMap.other = vatGroups.value.find((v) => v.name === 'BTW Laag');
  }
});

const handleProductAdd = async () => {
  // Add predefined product
  if (props.container && selectProduct.value && !edit.value) {
    await containerStore.addProductToContainer(props.container, selectProduct.value as ProductResponse);
  }
  // Create an add new product
  else if (props.container && edit.value && !selectProduct.value) {
    await handleSubmit(async (values) => {
      const createProductRequest: CreateProductRequest = {
        name: values.name,
        priceInclVat: {
          amount: values.price * 100,
          currency: 'EUR',
          precision: 2
        },
        vat: values.vatGroup.id,
        category: values.category.id,
        alcoholPercentage: values.alcoholPercentage || 0,
        ownerId: values.owner.id
      };

      await productStore.createProduct(createProductRequest, productImage.value)
          .then((createdProduct: ProductResponse) => {
        if (props.container) containerStore.addProductToContainer(props.container, createdProduct);
      });
    })();
  }
  closeDialog();
};

const changed = () => {
  if (props.product === undefined) return;
  return name.value !== props.product.name ||
      category.value?.id !== props.product.category.id ||
      vat.value?.id !== props.product.vat.id ||
      price.value !== props.product.priceInclVat!.amount / 100 ||
      alcoholPercentage.value !== props.product.alcoholPercentage;
};

const handleSaveProduct = async () => {
  if (!state.displayProduct) return;
  if (changed()) {
  await handleSubmit(async () => {
    const updateProductRequest: UpdateProductRequest = {
      alcoholPercentage: alcoholPercentage.value as number,
      category: category.value?.id as number,
      featured: false,
      name: name.value as string,
      preferred: false,
      priceInclVat: {
        amount: Math.round(price.value as number * 100),
        currency: 'EUR',
        precision: 2
      },
      priceList: false,
      vat: vat.value?.id as number,
    };
    if (!props.product) return;
    await productStore.updateProduct(props.product.id, updateProductRequest)
        .then((updatedProduct: ProductResponse) => {
          displayProduct.value = updatedProduct;
        });
  })();
  }
  if (productImage.value && props.product) {
    await productStore.updateProductImage(props.product.id, productImage.value);
  }
  closeDialog();
};

const selectCloseTo = () => {
  if (!closeTo.value) return;
  selectProduct.value = closeTo.value;
  closeTo.value = null;
};

watch(() => props.product, () => {
  if (props.product) {
    displayProduct.value = props.product;
    updateFieldValues(props.product);
  }
});

const closeDialog = () => {
  if (!state.displayProduct) {
    resetForm();
    imageSrc.value = '';
  }
  selectProduct.value = undefined;
  productImage.value = undefined;
  closeTo.value = null;
  vatMap.edited = false;
  emit('update:visible', false);
};

const onImgUpload = (event: any) => {
  //@ts-ignore
  productImage.value = event.files[0];
  imageSrc.value =  URL.createObjectURL(event.files[0]);
};

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

.error-text-name {
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 17rem;
  cursor: pointer;
}

</style>
