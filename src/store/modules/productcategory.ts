/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import { ProductCategory } from '@/entities/ProductCategory';
import APIHelper from '@/mixins/APIHelper';
import ProductCategoryTransformer from '@/transformers/ProductCategoryTransformer';

@Module({ namespaced: true, name: 'productCategories' })
export default class ProductCategoryModule extends VuexModule {
  productCategories: ProductCategory[] = [];

  get getProductCategories() {
    if (this.productCategories.length === 0) {
      this.fetchProductCategories();
    }
    return this.productCategories;
  }

  @Mutation
  setProductCategories(productCategories: ProductCategory[]) {
    this.productCategories = productCategories;
  }

  @Mutation
  addProductCategory(productCategory: ProductCategory) {
    const productCategoryResponse = APIHelper.postResource('productCategory', productCategory);
    this.productCategories.push(ProductCategoryTransformer.makeProductCategory(productCategoryResponse));
  }

  @Mutation
  removeProductCategory(productCategory: ProductCategory) {
    APIHelper.delResource('productCategories', productCategory);
    const index = this.productCategories.findIndex(prdc => prdc.id === productCategory.id);
    this.productCategories.splice(index, 1);
  }

  @Mutation
  updateAdvertisement(productCategory: {}) {
    const response = APIHelper.putResource('productCategories', productCategory);
    const productCategoryResponse = ProductCategoryTransformer.makeProductCategory(response);
    const index = this.productCategories.findIndex(prdc => prdc.id === productCategoryResponse.id);
    this.productCategories[index] = productCategoryResponse;
  }

  @Action
  fetchProductCategories() {
    const productCategoriesResponse = APIHelper.getResource('productCategories') as [];
    productCategoriesResponse.map(productCategory => ProductCategoryTransformer.makeProductCategory(productCategory));
    this.context.commit('setProductCategories', productCategoriesResponse);
  }
}
