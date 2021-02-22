import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { BaseProduct, Product } from '@/entities/Product';
import ProductTransformer from '@/transformers/ProductTransformer';

@Module({ dynamic: true, store, name: 'ProductsModule' })
export default class ProductsModule extends VuexModule {
  products: Product[] | BaseProduct[] = [];

  @Mutation
  setProducts(products: Product[]) {
    this.products = products;
  }

  @Mutation
  addProduct(product: {}) {
    const productResponse = APIHelper.postResource('products', product);
    this.products.push(ProductTransformer.makeProduct(productResponse) as Product);
  }

  @Mutation
  removeProduct(product: Product) {
    APIHelper.delResource('products', product);
    const index = this.products.findIndex(prd => prd.id === product.id);
    this.products.splice(index, 1);
  }

  @Mutation
  updateProduct(product: {}) {
    const response = APIHelper.putResource('products', product);
    const productResponse = ProductTransformer.makeProduct(response);
    const index = this.products.findIndex(prd => prd.id === productResponse.id);
    this.products[index] = productResponse;
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchProducts(force: boolean = false) {
    if (this.products.length === 0 || force) {
      const productsResponse = APIHelper.getResource('products') as [];
      productsResponse.map(product => ProductTransformer.makeProduct(product));
      this.context.commit('setProducts', productsResponse);
    }
  }
}
