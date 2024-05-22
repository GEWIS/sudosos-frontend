<template>
  <Dialog modal v-model:visible="visible" :header="$t('manageProducts.Add product')" class="w-auto flex"
          @update:visible="closeDialog">
    <form @submit="handleProductCreate">
      <div class="flex gap-5 overflow-hidden">
        <!-- Row for Picture -->
        <div class="picture-container p-3">
<!--          <img class="product-image" :src="getProductImageSrc(product)" :alt="product.name">-->
          <div class="field grid">
            <div class="col-12 md:col-10">
              <label for="img" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("c_productEditModal.Image") }}</label>
              <FileUpload id="img" mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)"/>
            </div>
          </div>
        </div>

        <div class="flex flex-column w-30rem justify-content-between pr-5 py-5 gap-3">
          <div class="flex flex-row justify-content-between">
            <label for="name">{{ $t('c_productInfoModal.Name') }}</label>
            <div>
              <InputText id="name" v-model="name" type="text" v-bind="nameAttrs"/>
              <br>
              <span class="error-text">{{ errors.name }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="category">{{ $t('c_productInfoModal.Category') }}</label>
            <div>
              <Dropdown :placeholder="$t('c_productEditModal.Please select')" :options="categories" optionLabel="name"
                        v-model="category" id="category" v-bind="categoryAttrs"/>
              <br>
              <span class="error-text">{{ errors.category }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="vat">{{ $t('c_productEditModal.VAT') }}</label>
            <div>
              <Dropdown :placeholder="$t('c_productEditModal.Please select VAT')" :options="vatGroups"
                        optionLabel="percentage" v-model="vat" v-bind="vatAttrs"/>
              <br>
              <span class="error-text">{{ errors.vatGroup }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between" v-if="category && category.name === 'Alcoholic'">
            <label for="alcohol">{{
                $t('c_productEditModal.Alcohol Percentage')
              }}</label>
            <div>
              <InputNumber id="alcohol" v-model="alcoholPercentage" v-bind="alcoholPercentageAttrs"/>
              <span class="error-text">{{ errors.alcoholPercentage }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="price" >{{ $t('c_productEditModal.Price') }}</label>
            <div>
              <InputNumber id="price" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2"/>
              <br>
              <span class="error-text">{{ errors.price }}</span>
            </div>
          </div>
          <div class="flex flex-row justify-content-between">
            <label for="owner" >{{ $t('c_POSCreate.Owner') }}</label>
            <div>
              <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                        v-model="owner" id="owner" v-bind="ownerAttrs"/>
              <br>
              <span class="error-text">{{ errors.owner }}</span>
            </div>
          </div>
          <div class="flex justify-content-end">
            <Button type="submit" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
          </div>
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { handleError } from "@/utils/errorUtils";
import { useProductStore } from "@/stores/product.store";
import type { Ref, ComputedRef } from 'vue';
import type {
  BaseUserResponse,
  CreateProductRequest,
  ProductCategoryResponse,
  VatGroupResponse
} from '@sudosos/sudosos-client';
import { getProductImageSrc } from "@/utils/imageUtils";

const productSchema = yup.object({
  name: yup.string().required(),
  category: yup.mixed<ProductCategoryResponse>().required(),
  vatGroup: yup.mixed<VatGroupResponse>().required(),
  alcoholPercentage: yup.number(),
  price: yup.number().required(),
  owner: yup.mixed<BaseUserResponse>().required()
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: productSchema
});

const productStore = useProductStore();
const authStore = useAuthStore();

const toast = useToast();
const { t } = useI18n();
const visible: Ref<boolean | undefined> = ref(false);
const emit = defineEmits(['update:visible', 'productCreated']);

const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const organsList: Ref<BaseUserResponse[]> = ref([]);

const [name, nameAttrs] = defineField('name');
const [category, categoryAttrs] = defineField('category');
const [vat, vatAttrs] = defineField('vatGroup');
const [price, priceAttrs] = defineField('price');
const [owner, ownerAttrs] = defineField('owner');
const [alcoholPercentage, alcoholPercentageAttrs] = defineField('alcoholPercentage');
const productImage: Ref<File | undefined> = ref();

onMounted(async () => {
  await productStore.fetchAllIfEmpty();
  organsList.value = authStore.organs;
});

const handleProductCreate = handleSubmit(async (values) => {
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

  await productStore.createProduct(createProductRequest, productImage.value).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.productCreated'),
      life: 3000,
    });
    emit('productCreated');
    emit('update:visible', false);
  }).catch((err) => handleError(err, toast));
});

const closeDialog = () => {
  emit('update:visible', false);
};

const onImgUpload = (event: any) => {
  //@ts-ignore
  productImage.value = event.files[0];
};
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

.error-text {
  color: red;
  font-weight: bolder;
}
</style>
