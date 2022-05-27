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
  reset() {
    this.products = [];
    this.userProducts = [];
  }

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
    APIHelper.delResource('products').then(() => {
      const index = this.products.findIndex((prd) => prd.id === product.id);
      this.userProducts.splice(index, 1);
    });
  }

  @Mutation
  updateProduct(product: Product) {
    const response = APIHelper.patchResource(`products/${product.id}`, product);
    const productResponse = ProductTransformer.makeProduct(response);
    const index = this.userProducts.findIndex((prd) => prd.id === productResponse.id);
    this.userProducts.splice(index, 1, productResponse as Product);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchProducts(force: boolean = false) {
    if (this.products.length === 0 || force) {
      (APIHelper.getResource('products') as Promise<{ records: any[]}>).then((res) => {
        const products = res.records.map((product) => ProductTransformer.makeProduct(product));
        this.context.commit('setProducts', products);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchUserProducts(force: boolean = false) {
    if (this.userProducts.length === 0 || force) {
      (APIHelper.getResource('userproducts') as Promise<{ records: any[]}>).then((res) => {
        const products = res.records.map((product) => ProductTransformer.makeProduct(product));
        this.context.commit('setUserProducts', products);
      });
    }
  }
}
