import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { Product } from '@/entities/Product';
import { Container } from '@/entities/Container';
import ProductTransformer from '@/transformers/ProductTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';

@Module({ dynamic: true, store, name: 'ContainerModule' })
export default class ContainerModule extends VuexModule {
  containers: Container[] = [];

  get getPublicContainers() {
    return this.containers.filter(cntnr => cntnr.public);
  }

  @Mutation
  setContainers(containers: Container[]) {
    this.containers = containers;
  }

  @Mutation
  addContainer(container: Container) {
    const containerResponse = APIHelper.postResource('container', container);
    this.containers.push(ContainerTransformer.makeContainer(containerResponse) as Container);
  }

  @Mutation
  addProduct(container: Container, product: Product) {
    let productResponse = APIHelper.postResource('product', product);
    productResponse = ProductTransformer.makeProduct(productResponse);
    let containerResponse = APIHelper.postResource(`container/${container.id}/product`, productResponse);
    containerResponse = ContainerTransformer.makeContainer(containerResponse);
    const index = this.containers.findIndex(cntnr => cntnr.id === container.id);
    this.containers[index] = containerResponse as Container;
  }

  @Mutation
  removeContainer(container: Container) {
    APIHelper.delResource('containers', container);
    const index = this.containers.findIndex(cntnr => cntnr.id === container.id);
    this.containers.splice(index, 1);
  }

  @Mutation
  updateContainer(container: {}) {
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
      containersResponse.map(container => ContainerTransformer.makeContainer(container));
      this.context.commit('setContainers', containersResponse);
    }
  }
}
