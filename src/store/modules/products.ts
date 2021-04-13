import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product } from '@/entities/Product';
import ProductTransformer from '@/transformers/ProductTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'ProductsModule',
})
export default class ProductsModule extends VuexModule {
  products: Product[] = [];

  userProducts: Product[] = [];

  @Mutation
  setProducts(products: Product[]) {
    this.products = products;
  }

  @Mutation
  setUserProducts(products: Product[]) {
    this.userProducts = products;
  }

  @Mutation
  addProduct(product: {}) {
    const productResponse = APIHelper.postResource('products', product);
    const productToAdd = ProductTransformer.makeProduct(productResponse) as Product;
    this.userProducts.push(productToAdd);
  }

  @Mutation
  removeProduct(product: Product) {
    APIHelper.delResource('products', product);
    const index = this.products.findIndex(prd => prd.id === product.id);
    this.userProducts.splice(index, 1);
  }

  @Mutation
  updateProduct(product: {}) {
    const response = APIHelper.putResource('products', product);
    const productResponse = ProductTransformer.makeProduct(response);
    const index = this.userProducts.findIndex(prd => prd.id === productResponse.id);
    this.userProducts.splice(index, 1, productResponse as Product);
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchProducts(force: boolean = false) {
    if (this.products.length === 0 || force) {
      const productsResponse = APIHelper.getResource('products') as [];
      const products = productsResponse.map(product => ProductTransformer.makeProduct(product));
      this.context.commit('setProducts', products);
    }
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchUserProducts(force: boolean = false) {
    if (this.userProducts.length === 0 || force) {
      const productsResponse = APIHelper.getResource('userproducts') as [];
      const products = productsResponse.map(product => ProductTransformer.makeProduct(product));
      this.context.commit('setUserProducts', products);
    }
  }
}
