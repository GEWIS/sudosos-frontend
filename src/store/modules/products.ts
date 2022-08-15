import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/entities/Product';
import ProductTransformer from '@/transformers/ProductTransformer';
import { setProductImage } from '@/api/products';

@Module({
  dynamic: true, namespaced: true, store, name: 'ProductsModule',
})
export default class ProductsModule extends VuexModule {
  products: Product[] = [];

  @Mutation
  reset() {
    this.products = [];
  }

  @Mutation
  setProducts(products: Product[]) {
    this.products = products;
  }

  @Mutation
  addProductToState(product: Product) {
    this.products.push(product);
    this.products = this.products.sort();
  }

  @Mutation
  updateProductInState(product: Product) {
    const index = this.products.findIndex((prd) => prd.id === product.id);
    if (index < 0) {
      this.context.commit('addProductToState', product);
      return;
    }
    this.products.splice(index, 1, product);
  }

  @Mutation
  removeProductFromState(product: Product) {
    const index = this.products.findIndex((prd) => prd.id === product.id);
    if (index >= 0) this.products.splice(index, 1);
  }

  @Action
  async addProduct(data: { product: CreateProductRequest, image?: File }) {
    let productResponse = await APIHelper.postResource('products', data.product);
    if (data.image) await setProductImage(productResponse.id, data.image);
    productResponse = await APIHelper.getResource(`products/${productResponse.id}`);
    const productToAdd = ProductTransformer.makeProduct(productResponse) as Product;
    this.context.commit('addProductToState', productToAdd);
  }

  @Action
  async removeProduct(product: Product) {
    await APIHelper.delResource('products');
    this.context.commit('removeProductFromState', product);
  }

  @Action
  async updateProduct(data: { product: UpdateProductRequest, image?: File }) {
    const { product, image } = data;
    const updateRequest = {
      ...product,
    };
    delete updateRequest.id;

    await APIHelper.patchResource(`products/${product.id}`, updateRequest);
    if (image) {
      await setProductImage((product as any).id, image);
    }
    const response = await APIHelper.getResource(`products/${product.id}`);
    const productResponse = ProductTransformer.makeProduct(response);

    this.context.commit('updateProductInState', productResponse);
    this.context.commit('ContainerModule/updateContainerProductInAllContainers', productResponse, { root: true });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchProducts(force: boolean = false) {
    if (this.products.length === 0 || force) {
      const res = await APIHelper.getResource('products');
      const products = res.records.map((product: any) => ProductTransformer.makeProduct(product));
      this.context.commit('setProducts', products);
    }
  }

  // @Action({
  //   rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  // })
  // fetchUserProducts(force: boolean = false) {
  //   if (this.userProducts.length === 0 || force) {
  //     (APIHelper.getResource('userproducts') as Promise<{ records: any[]}>).then((res) => {
  //       const products = res.records.map((product) => ProductTransformer.makeProduct(product));
  //       this.context.commit('setUserProducts', products);
  //     });
  //   }
  // }
}
