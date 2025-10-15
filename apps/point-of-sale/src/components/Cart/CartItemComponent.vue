<template>
  <div class="mt-1">
    <div class="flex flex-row items-center justify-between mb-2 h-15 min-h-0 max-w-full">
      <img
        :id="product.name"
        :alt="product.name"
        class="size-12 object-contain rounded bg-white"
        :src="getProductImageSrc(product)"
      />
  
      <div class>
        <h4 class="font-bold m-0 truncate w-5rem" style="max-width: 100px">{{ product.name }}</h4>
        <p class="text-sm m-0">{{ product.category.name }}</p>
      </div>
      <div class="flex gap-2">
        <Button class="bg-red w-5 h-6 shadow-sm" @click="decreaseQuantity">-</Button>
        <span class="font-bold w-5 text-center">{{ cartProduct.count }}</span>
        <Button class="w-5 h-6 shadow-sm" @click="increaseQuantity">+</Button>
      </div>
      <p class="font-bold text-right">€{{ totalPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ProductResponse } from '@sudosos/sudosos-client';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';

const cartStore = useCartStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true,
  },
});

const product = ref<ProductResponse>(props.cartProduct.product);
const decreaseQuantity = () => {
  cartStore.removeFromCart(props.cartProduct);
};

const increaseQuantity = () => {
  cartStore.addToCart({ ...props.cartProduct, count: 1 });
};

const totalPrice = computed(() => {
  const price = product.value.priceInclVat.amount * props.cartProduct.count;
  return formatPrice(price);
});
</script>

<style scoped lang="scss">
</style>
