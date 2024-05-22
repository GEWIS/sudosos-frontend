<template>
    <Dialog v-model:visible="visible"
            :header="$t('c_ContainerAssign.Assign product')"
            :draggable="false"
            modal
            @after-hide="resetForm"
            ref="assignProduct"
            @show="addListenerOnDialogueOverlay(assignProduct)"
    >
        <form @submit="handleProductCreate">
            <div class="row">
                <p class="prop">{{ $t('c_ContainerAssign.Product') }}</p>
                <Dropdown
                    :placeholder="$t('c_ContainerAssign.Select product')"
                    :options="products.filter(prod => !container.products.map(e => e.id).includes(prod.id))"
                    optionLabel="name"
                    v-bind="productAttrs"
                    v-model="product"
                    editable
                />
                <div class="error-text">{{ errors.product }}</div>
            </div>
            <div class="row">
                <Button type="submit" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
            </div>
        </form>
    </Dialog>

</template>
<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import type { ProductResponse } from '@sudosos/sudosos-client';
import Dialog from 'primevue/dialog';
import { ref, type PropType, type Ref, onBeforeMount } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from "@vee-validate/yup";
import { computed } from 'vue';
import { useI18n } from "vue-i18n";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import { useProductStore } from "@/stores/product.store";
import { useContainerStore } from "@/stores/container.store";
const { t } = useI18n();
const assignProduct: Ref<null | any> = ref(null);

const schema = toTypedSchema(
  yup.object({
    product: yup.mixed<ProductResponse>()
      .test({
        name: 'unique-product',
        message: () => t("c_ContainerAssign.Product selection error"),
        test: (product: ProductResponse | undefined) =>
            product == null || !props.container.products.map(e => e.id).includes(product.id)
      })
      .required(),
  })
);

const { defineField, resetForm, errors, handleSubmit } = useForm({
  validationSchema: schema,
});

const [product, productAttrs] = defineField('product');


const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
      required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
});

const emit = defineEmits(['update:visible', 'update:products']);

const productStore = useProductStore();
const products = computed(() => Object.values(productStore.getProducts).sort((a, b) => a.name.localeCompare(b.name)));
const containerStore = useContainerStore();

onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();
});

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  }
});

const handleProductCreate = handleSubmit(async (values) => {
  await containerStore.addProductToContainer(props.container, values.product);
  visible.value = false;
});

</script>
<style>
.row {
    margin: 1rem 0;
}

</style>
