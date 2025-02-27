<template>
  <CardComponent :header="t('modules.seller.productContainers.products.header')" class="w-full">
    <template #topAction>
      <div>
        <Button
            @click="openCreateModal"
            v-if="isAllowed('create', ['own', 'organ'], 'Product')"
        >
          {{ t('common.create') }}
        </Button>
      </div>
    </template>
    <ProductActionDialog
        v-model:visible="visible"
        :product="product"
        :is-update-allowed="isAllowed('update', ['own', 'organ'], 'Product')"
    />
    <DataTable
        v-model:filters="filters"
        :value="products"
        paginator
        tableStyle="min-width: 50rem"
        :rows="5"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        filterDisplay="menu"
        :globalFilterFields="['name']"
        :pt="{
                  table: {
                    style: 'table-layout: fixed; width: 100%;'
                  }
              }"
    >
      <template #header>
        <div class="flex flex-row justify-content-between">
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search"></InputIcon>
            <InputText v-model="filters['global'].value" placeholder="Search"/>
          </IconField>
        </div>
      </template>
      <Column field="image" :header="t('modules.seller.productContainers.products.image')">
        <template #body="rowDataImg" v-if="!loading">
          <Image
              :src="getProductImageSrc(rowDataImg.data)" preview
              class="h-4rem w-4rem image-preview-container"
              :pt="{
                image: {
                  class: 'h-4rem w-4rem',
                  style: {
                    'object-fit': 'contain',
                    'box-sizing': 'border-box'
                  }
                }
              }"
          />
        </template>
        <template #body v-else>
          <Skeleton class="w-8 my-1 h-4rem surface-300"/>
        </template>
      </Column>
      <Column field="name" :header="t('common.name')" style="width: 30%">
        <template #body v-if="loading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="category" :header="t('modules.seller.productContainers.products.category')" style="width: 15%">
        <template #body="rowData" v-if="!loading">
          {{ rowData.data.category.name }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="priceInclVat" :header="t('common.price')" style="width: 17%">
        <template #body="rowData" v-if="!loading">
          {{ formatPrice(rowData.data.priceInclVat) }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="alcoholPercentage"
              :header="t('modules.seller.productContainers.products.alcoholPercentage')" style="width: 10%">
        <template #body="rowData" v-if="!loading">
          {{ `${rowData.data.alcoholPercentage} %` }}
        </template>
        <template #body v-else>
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
      </Column>
      <Column field="vat" :header="t('modules.seller.productContainers.products.vat')" style="width: 10%">
        <template #body v-if="loading">
          <Skeleton class="w-6 my-1 h-2rem surface-300"/>
        </template>
        <template #body="rowData" v-else>
          {{ `${rowData.data.vat.percentage} %` }}
        </template>

      </Column>
      <Column
          bodyStyle="text-align:center"
          style="width: 5%"
      >
        <template #body v-if="loading">
          <Skeleton class="w-3 my-1 h-2rem surface-300"/>
        </template>
        <template #body="rowData" v-else>
          <Button
              @click="openEditModal(rowData.data.id)"
              type="button"
              outlined
              severity="secondary"
              icon="pi pi-info-circle"
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { getProductImageSrc } from "@/utils/urlUtils";
import { formatPrice } from "@/utils/formatterUtils";
import IconField from "primevue/iconfield";
import CardComponent from "@/components/CardComponent.vue";
import InputIcon from "primevue/inputicon";
import Column from "primevue/column";
import Skeleton from "primevue/skeleton";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { computed, onBeforeMount, type Ref, ref } from "vue";
import type { ProductResponse } from "@sudosos/sudosos-client";
import { useProductStore } from "@/stores/product.store";
import { FilterMatchMode } from "primevue/api";
import ProductActionDialog from "@/modules/seller/components/ProductActionDialog.vue";
import { useI18n } from "vue-i18n";
import { isAllowed } from "@/utils/permissionUtils";

const { t } = useI18n();

const loading: Ref<boolean> = ref(true);
const visible: Ref<boolean> = ref(false);
const product: Ref<ProductResponse | undefined> = ref(undefined);
const productStore = useProductStore();

const products = computed<ProductResponse[]>(() => Object.values(productStore.getAllProducts)
    .sort((a, b) => a.name.localeCompare(b.name)));

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
  loading.value = false;
});

const openCreateModal = () => {
  product.value = undefined;
  visible.value = true;
};

const openEditModal = (id: number) => {
  product.value = productStore.getSingleProduct(id);
  visible.value = true;
};

</script>

<style scoped lang="scss">
.image-preview-container {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.image-preview-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border: none;
  padding: 0;
}

.fileupload > input[type='file'],
.fileupload-basic input[type='file'] {
  display: none;
}

.image-preview-container:hover > .image-preview-indicator {
  opacity: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5)
}

.background-white {
  background-color: #fff;
}

.product-image {
  object-fit: contain;
  box-sizing: border-box;
}
</style>
