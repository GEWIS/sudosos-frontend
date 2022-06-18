import {
  Action, getModule, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { CreateProductRequest, Product, UpdateProductRequest } from '@/entities/Product';
import { Container } from '@/entities/Container';
import ProductTransformer from '@/transformers/ProductTransformer';
import ContainerTransformer from '@/transformers/ContainerTransformer';
import ProductsModule from '@/store/modules/products';
import { postProductImage, setProductImage } from '@/api/products';

const productState = getModule(ProductsModule);

export interface ContainerStorage {
  [key: number]: Container;
}

@Module({
  dynamic: true, namespaced: true, store, name: 'ContainerModule',
})
export default class ContainerModule extends VuexModule {
  containerMapping = new Map();

  publicContainers: Container[] = [];

  @Mutation
  reset() {
    this.containerMapping = new Map();
    this.publicContainers = [];
  }

  @Mutation
  setContainers(containers: Container[]) {
    containers.forEach((c) => {
      this.containerMapping.set(c.id, c);
    });
  }

  @Mutation
  setPublicContainers(containers: Container[]) {
    this.publicContainers = containers;
  }

  @Mutation
  addContainer(container: any) {
    const containerResponse = APIHelper.postResource('containers', container);
    const newContainer = ContainerTransformer.makeContainer(containerResponse) as Container;
    this.containerMapping.set(newContainer.id, newContainer);
  }

  @Mutation
  async addProduct(data: { container: Container, product:
      CreateProductRequest | UpdateProductRequest, file?: File}) {
    let productToAdd = data.product;

    // If this is not an existing product yet we need to add it
    if (!('id' in data.product) || data.product.id === null) {
      await APIHelper.postResource('products', data.product).then(async (product: Product) => {
        productToAdd = product as any;
        if (data.file) await setProductImage(product.id, data.file);
      });
    }

    APIHelper.getResource(`containers/${data.container.id}`).then((containerResponse: Container) => {
      const products = containerResponse.products.map((p) => p.id);
      products.push((productToAdd as UpdateProductRequest).id);
      const containerUpdate = {
        name: containerResponse.name,
        public: containerResponse.public,
        products,
      };
      APIHelper.patchResource(`containers/${data.container.id}`, containerUpdate);
      const newProduct = ProductTransformer.makeProduct(productToAdd) as Product;
      this.containerMapping.get(data.container.id).products.push(newProduct);
    });
  }

  @Mutation
  // eslint-disable-next-line class-methods-use-this
  removeProduct(data: {container: Container, product: {id?: number | null} }) {
    APIHelper.getResource(`containers/${data.container.id}`).then((containerResponse: Container) => {
      const products = containerResponse.products.map((p) => p.id);
      const remaining = products.filter((p) => p !== data.product.id);
      const containerUpdate = {
        name: containerResponse.name,
        public: containerResponse.public,
        products: remaining,
      };
      APIHelper.patchResource(`containers/${data.container.id}`, containerUpdate);
    });
  }

  @Mutation
  removeContainer(containerId: number) {
    APIHelper.delResource(`containers/${containerId}`);
    this.containerMapping.delete(containerId);
  }

  @Mutation
  updateContainer(container: any) {
    const response = APIHelper.putResource('containers', container);
    const containerResponse = ContainerTransformer.makeContainer(response) as Container;
    this.containerMapping.set(containerResponse.id, containerResponse);
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  fetchContainers(force: boolean = false) {
    if (Object.keys(this.containerMapping).length === 0 || force) {
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
