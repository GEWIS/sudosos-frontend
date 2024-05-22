<template>
  <Dialog v-model:visible="visible" ref="dialog" modal :draggable="false" :header="product.name" :pt="{content: 'p-0'}" @show="addListenerOnDialogueOverlay(dialog)">
    <div class="flex gap-5 overflow-hidden">
      <!-- Row for Picture -->
      <div class="picture-container p-3">
        <img class="product-image" :src="getProductImageSrc(product)" :alt="product.name">
      </div>

      <div class="flex flex-column w-25rem justify-content-between pr-5 py-5">
        <div class="flex flex-column">
          <!-- Row for Name -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Name") }}</h4>
            <p class="my-0">{{ product.name }}</p>
          </div>

          <!-- Row for Added by -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">Owner</h4>
            <p class="my-0">{{ product.owner.firstName + ' ' + product.owner.lastName }}</p>
          </div>

          <!-- Row for Added on -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Added on") }}</h4>
            <p class="my-0">{{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Updated on -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Updated on") }}</h4>
            <p class="my-0">{{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Price -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Price") }}</h4>
            <p class="my-0">{{ formatPrice(product.priceInclVat) }}</p>
          </div>

          <!-- Row for Category -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Category") }}</h4>
            <p class="my-0">{{ product.category.name }}</p>
          </div>

          <!-- Row for Alcohol percentage -->
          <div class="flex flex-row justify-content-between">
            <h4 class="my-0">{{ $t("c_productInfoModal.Alcohol percentage") }}</h4>
            <p class="my-0">{{ product.alcoholPercentage + '%' }}</p>
          </div>
        </div>
        <Button @click="handleDeleteProduct" class="w-auto ml-auto">
          Delete from container
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import type { ContainerWithProductsResponse, ProductResponse } from "@sudosos/sudosos-client";
import Dialog from 'primevue/dialog';
import { type Ref, ref } from "vue";
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatDateTime, formatPrice } from "@/utils/formatterUtils";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { useContainerStore } from "@/stores/container.store";

const dialog: Ref<null|any> = ref(null);

const toast = useToast();
const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});

const visible = ref(false);
const { t } = useI18n();
const containerStore = useContainerStore();

const handleDeleteProduct = async () => {
  await containerStore.deleteProductFromContainer(props.container, props.product).then(() => {
        toast.add({
          severity: 'success',
          summary: t('successMessages.success'),
          detail: t('successMessages.deleteProductContainer'),
          life: 3000,
        });
      }
  ).catch((error) => handleError(error, toast));
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
</style>
