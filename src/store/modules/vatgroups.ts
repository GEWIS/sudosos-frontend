import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/entities/Product';
import { VatGroup } from '@/entities/VatGroup';
import ProductTransformer from '@/transformers/ProductTransformer';
import { getAllProducts, setProductImage } from '@/api/products';
import { getAllVatGroups } from '@/api/vatGroups';

@Module({
  dynamic: true, namespaced: true, store, name: 'VatGroupsModule',
})
export default class VatGroupsModule extends VuexModule {
  vatGroups: VatGroup[] = [];

  @Mutation
  reset() {
    this.vatGroups = [];
  }

  @Mutation
  setVatGroups(vatGroups: VatGroup[]) {
    this.vatGroups = vatGroups;
  }

  @Mutation
  addVatGroupsToState(vatGroup: VatGroup) {
    this.vatGroups.push(vatGroup);
    this.vatGroups = this.vatGroups.sort();
  }

  @Mutation
  updateVatGroupInState(vatGroup: VatGroup) {
    const index = this.vatGroups.findIndex((vat) => vat.id === vatGroup.id);
    if (index < 0) {
      this.context.commit('addVatGroupToState', vatGroup); // TODO
      return;
    }
    this.vatGroups.splice(index, 1, vatGroup);
  }

  @Mutation
  removeVatGroupFromState(product: Product) {
    const index = this.vatGroups.findIndex((vat) => vat.id === product.id);
    if (index >= 0) this.vatGroups.splice(index, 1);
  }

  // TODO
  @Action
  async addVatGroup(data: { product: CreateProductRequest, image?: File }) {
    let productResponse = await APIHelper.postResource('products', data.product);
    if (data.image) await setProductImage(productResponse.id, data.image);
    productResponse = await APIHelper.getResource(`products/${productResponse.id}`);
    const productToAdd = ProductTransformer.makeProduct(productResponse) as Product;
    this.context.commit('addProductToState', productToAdd);
  }

  // TODO
  @Action
  async removeVatGroup(product: Product) {
    await APIHelper.delResource('products');
    this.context.commit('removeProductFromState', product);
  }

  // TODO
  @Action
  async updateVatGroups(data: { product: UpdateProductRequest, image?: File }) {
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
  async fetchVatGroups(force: boolean = false) {
    if (this.vatGroups.length === 0 || force) {
      const vatGroups = await getAllVatGroups();
      this.context.commit('setVatGroups', vatGroups);
    }
  }
}
