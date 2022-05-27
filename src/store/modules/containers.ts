import {
  Action, getModule, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product } from '@/entities/Product';
import { Container } from '@/entities/Container';
import ProductTransformer from '@/transformers/ProductTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import ProductsModule from '@/store/modules/products';

const productState = getModule(ProductsModule);

@Module({
  dynamic: true, namespaced: true, store, name: 'ContainerModule',
})
export default class ContainerModule extends VuexModule {
  containers: Container[] = [];

  publicContainers: Container[] = [];

  @Mutation
  reset() {
    this.containers = [];
    this.publicContainers = [];
  }

  @Mutation
  setContainers(containers: Container[]) {
    this.containers = containers;
  }

  @Mutation
  setPublicContainers(containers: Container[]) {
    this.publicContainers = containers;
  }

  @Mutation
  addContainer(container: any) {
    const containerResponse = APIHelper.postResource('containers', container);
    if (!this.containers) this.containers = [];
    this.containers.push(ContainerTransformer.makeContainer(containerResponse) as Container);
  }

  @Mutation
  addProduct(data: { container: Container, product: { id?: number | null} }) {
    let productToAdd = data.product;

    // If this is not an existing product yet we need to add it
    if (!('id' in data.product) || data.product.id === null) {
      APIHelper.postResource('products', data.product).then((product: Product) => {
        productToAdd = product;
        productState.addProduct(data.product);
      });
    }

    // TODO: Check if this works with real API
    const containerResponse = APIHelper.postResource(`containers/${data.container.id}/product`, productToAdd);
    // const updatedContainer = ContainerTransformer.makeContainer(containerResponse);
    const index = this.containers.findIndex((cntnr) => cntnr.id === data.container.id);
    this.containers[index].products.push(ProductTransformer.makeProduct(productToAdd) as Product);
  }

  @Mutation
  updateProduct(data: {container: Container, product: { id?: number | null } }) {
    APIHelper.putResource('products', data.product).then((product: Product) => {
      const productToEdit = ProductTransformer.makeProduct(product) as Product;

      productState.updateProduct(productToEdit);

      // TODO: Check if this works with real API
      const containerResponse = APIHelper.putResource(`containers/${data.container.id}/product`, productToEdit);
      // const updatedContainer = ContainerTransformer.makeContainer(containerResponse);
      const index = this.containers.findIndex((cntnr) => cntnr.id === data.container.id);
      const prdIndex = this.containers[index].products.findIndex((prod) => (
        prod.id === data.product.id
      ));

      this.containers[index].products.splice(prdIndex, 1, productToEdit as Product);
    });
  }

  @Mutation
  removeProduct(data: {container: Container, product: {id?: number | null} }) {
    // TODO: Check if this works with real API
    const containerResponse = APIHelper.delResource(`containers/${data.container.id}/product`);
    // const updatedContainer = ContainerTransformer.makeContainer(containerResponse);
    const index = this.containers.findIndex((cntnr) => cntnr.id === data.container.id);
    const prdIndex = this.containers[index].products.findIndex((prod) => (
      prod.id === data.product.id
    ));

    this.containers[index].products.splice(prdIndex, 1);
  }

  @Mutation
  removeContainer(container: any) {
    APIHelper.delResource('containers', container);
    const index = this.containers.findIndex((cntnr) => cntnr.id === container.id);
    this.containers.splice(index, 1);
  }

  @Mutation
  updateContainer(container: any) {
    const response = APIHelper.putResource('containers', container);
    const containerResponse = ContainerTransformer.makeContainer(response);
    const index = this.containers.findIndex((cntnr) => cntnr.id === containerResponse.id);
    this.containers.splice(index, 1, containerResponse as Container);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchContainers(force: boolean = false) {
    if (this.containers.length === 0 || force) {
      (APIHelper.getResource('containers') as Promise<{records: any[]}>).then((res) => {
        const cntrs = res.records.map((cntr) => ContainerTransformer.makeContainer(cntr));
        this.context.commit('setContainers', cntrs);
      });
    }
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchPublicContainers(force: boolean = false) {
    if (this.publicContainers.length === 0 || force) {
      (APIHelper.getResource('containers/public') as Promise<{records: any[]}>).then((res) => {
        const cntrs = res.records.map((cntr) => ContainerTransformer.makeContainer(cntr));
        this.context.commit('setPublicContainers', cntrs);
      });
    }
  }
}
