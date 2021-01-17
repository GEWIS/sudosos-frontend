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
      this.fetchProducts();
    }
    return this.products;
  }

  @Mutation
  setProducts(products: Product[]) {
    this.products = products;
  }

  @Mutation
  addProduct(product: {}) {
    const productResponse = APIHelper.postResource('products', product);
    this.products.push(ProductTransformer.makeProduct(productResponse));
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

  @Action
  fetchProducts() {
    const productsResponse = APIHelper.getResource('products') as [];
    productsResponse.map(product => ProductTransformer.makeProduct(product));
    this.context.commit('setProducts', productsResponse);
  }
}
