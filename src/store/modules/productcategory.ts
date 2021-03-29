/* eslint-disable max-len */

import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { ProductCategory } from '@/entities/ProductCategory';
import ProductCategoryTransformer from '@/transformers/ProductCategoryTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'ProductCategoryModule',
})
export default class ProductCategoryModule extends VuexModule {
  productCategories: ProductCategory[] = [];

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
  updateProductCategories(productCategory: {}) {
    const response = APIHelper.putResource('productCategories', productCategory);
    const productCategoryResponse = ProductCategoryTransformer.makeProductCategory(response);
    const index = this.productCategories.findIndex(prdc => prdc.id === productCategoryResponse.id);
    this.productCategories.splice(index, 1, productCategoryResponse);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchProductCategories(force: boolean = false) {
    if (this.productCategories.length === 0 || force) {
      const productCategoriesResponse = APIHelper.getResource('productCategories') as [];
      const ctgrs = productCategoriesResponse.map(productCategory => ProductCategoryTransformer.makeProductCategory(productCategory));
      this.context.commit('setProductCategories', ctgrs);
    }
  }
}
