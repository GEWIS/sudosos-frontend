import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product } from '@/entities/Product';
import { Container } from '@/entities/Container';
import ProductTransformer from '@/transformers/ProductTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';

@Module({
  dynamic: true, namespaced: true, store, name: 'ContainerModule',
})
export default class ContainerModule extends VuexModule {
  containers: Container[] = [];

  publicContainers: Container[] = [];

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
    const containerResponse = APIHelper.postResource('container', container);
    this.containers.push(ContainerTransformer.makeContainer(containerResponse) as Container);
  }

  @Mutation
  addProduct(container: Container, product: Product) {
    let productToAdd = product;

    // If this is not an existing product yet we need to add it
    if (!('id' in product)) {
      productToAdd = APIHelper.postResource('products', product) as Product;
    }

    const containerResponse = APIHelper.postResource(`container/${container.id}/product`, productToAdd);
    const updatedContainer = ContainerTransformer.makeContainer(containerResponse);
    const index = this.containers.findIndex(cntnr => cntnr.id === container.id);
    this.containers[index] = updatedContainer as Container;
  }

  @Mutation
  removeContainer(container: any) {
    APIHelper.delResource('containers', container);
    const index = this.containers.findIndex(cntnr => cntnr.id === container.id);
    this.containers.splice(index, 1);
  }

  @Mutation
  updateContainer(container: any) {
    const response = APIHelper.putResource('containers', container);
    const containerResponse = ContainerTransformer.makeContainer(response);
    const index = this.containers.findIndex(cntnr => cntnr.id === containerResponse.id);
    this.containers[index] = containerResponse as Container;
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchContainers(force: boolean = false) {
    if (this.containers.length === 0 || force) {
      const containersResponse = APIHelper.getResource('containers') as [];
      const cntrs = containersResponse.map(cntr => ContainerTransformer.makeContainer(cntr));
      this.context.commit('setContainers', cntrs);
    }
  }

  @Action({
    rawError: Boolean(process.env.VUE_APP_DEBUG_STORES),
  })
  fetchPublicContainers(force: boolean = false) {
    if (this.publicContainers.length === 0 || force) {
      const containersResponse = APIHelper.getResource('publiccontainer') as [];
      const cntrs = containersResponse.map(cntr => ContainerTransformer.makeContainer(cntr));
      this.context.commit('setPublicContainers', cntrs);
    }
  }
}
