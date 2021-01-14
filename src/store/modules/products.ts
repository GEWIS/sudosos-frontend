import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import { Product } from '@/entities/Product';
import APIHelper from '@/mixins/APIHelper';
import ProductTransformer from '@/transformers/ProductTransformer';

@Module({ namespaced: true, name: 'products' })
export default class ProductsModule extends VuexModule {
  products: Product[] = [];

  get getProducts() {
    if (this.products.length === 0) {
      this.fetchProduct();
    }
    return this.products;
  }

  @Mutation
  setProducts(products: Product[]) {
    this.products = products;
  }

  @Mutation
  addProduct(product: Product) {
    this.products.push(product);
  }

  @Mutation
  removeProduct(product: Product) {
    const index = this.products.findIndex(prd => prd.id === product.id);
    this.products.splice(index, 1);
  }

  @Mutation
  updateProduct(product: Product) {
    const index = this.products.findIndex(prd => prd.id === product.id);
    this.products[index] = product;
  }

  @Action
  fetchProduct() {
    const productsResponse = APIHelper.getResource('products') as [];
    productsResponse.map(product => ProductTransformer.makeProduct(product));
    this.context.commit('setProducts', productsResponse);
  }
}
