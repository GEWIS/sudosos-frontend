<template>
<b-modal
  id="product-info-modal"
  v-if="Object.keys(product).length > 0"
  :title="$t('c_productInfoModal.title')"
  size="lg"
  hide-header-close
  centered
>
  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Name') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ product.name }}</p>
    </b-col>
  </b-row>

  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Added by') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ product.owner.name }}</p>
    </b-col>
  </b-row>

  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Added on') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ formatDateTime(product.createdAt, true) }}</p>
    </b-col>
  </b-row>

  <b-row v-if="product.updatedAt">
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Updated on') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ formatDateTime(product.updatedAt, true) }}</p>
    </b-col>
  </b-row>

  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Price') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ product.price.toFormat() }}</p>
    </b-col>
  </b-row>

  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Category') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>{{ setCapitalLetter(product.category.name) }}</p>
    </b-col>
  </b-row>

  <b-row v-if="product.alcoholPercentage > 0">
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Alcohol percentage') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <p>
        {{ product.alcoholPercentage }}%
      </p>
    </b-col>
  </b-row>

  <b-row>
    <b-col cols="6" sm="4">
      <p class="font-weight-bold">{{ $t('c_productInfoModal.Picture') }}</p>
    </b-col>
    <b-col cols="6" sm="8" class="text-right text-sm-left">
      <img :src="`/static/products/${product.picture}`"
           :alt="$t('c_productInfoModal.Product picture')"/>
    </b-col>
  </b-row>

  <template v-slot:modal-footer="{ cancel }">
    <b-button
      variant="primary"
      id="confirm-cancel"
      @click="cancel"
    >{{ $t('c_productInfoModal.Cancel') }}
    </b-button>
  </template>
</b-modal>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { Product } from '@/entities/Product';
import Formatters from '@/mixins/Formatters';

  @Component
export default class ProductInfoModal extends Formatters {
    @Prop() private product!: Product;
}
</script>

<style lang="scss" scoped>
.row p {
  margin-bottom: 0.25rem;
}

img {
  max-height: 10rem;
  max-width: 10rem;
  height: 100%;
  width: 100%;
}
</style>
