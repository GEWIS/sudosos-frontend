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
import { getContainerProducts } from '@/api/containers';

interface ContainerProductParam {
  containerId: number;
  product: Product;
}

interface ContainerProductsParam {
  containerId: number;
  products: Product[];
}

@Module({
  dynamic: true, namespaced: true, store, name: 'ContainerModule',
})
export default class ContainerModule extends VuexModule {
  containerMapping = new Map<number, Container>();

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
  addContainerToState(container: Container) {
    this.containerMapping.set(container.id, container);
  }

  @Action
  async addContainer(container: any) {
    const containerResponse = await APIHelper.postResource('containers', container);
    const newContainer = ContainerTransformer.makeContainer(containerResponse) as Container;
    this.context.commit('addContainerToState', newContainer);
  }

  @Mutation
  setContainerProducts({ containerId, products }: ContainerProductsParam) {
    const container = this.containerMapping.get(containerId);
    container.products = products;
    this.containerMapping.set(containerId, container);
  }

  @Mutation
  addContainerProductToState({ containerId, product }: ContainerProductParam) {
    const container = this.containerMapping.get(containerId);
    container.products.push(product);
    this.containerMapping.set(containerId, container);
  }

  @Mutation
  updateContainerProductInAllContainers(product: Product) {
    const containersContainingProduct = Array.from(this.containerMapping.values())
      .filter((c) => c.products.map((p) => p.id).includes(product.id));
    containersContainingProduct.forEach((container) => {
      const index = container.products.findIndex((p) => p.id === product.id);
      if (index < 0) {
        this.context.commit('addContainerProductToState', product);
        return;
      }

      container.products.splice(index, 1, product);
      this.containerMapping.set(container.id, container);
    });
  }

  @Mutation
  updateContainerProductInState({ containerId, product }: ContainerProductParam) {
    const container = this.containerMapping.get(containerId);
    const index = container.products.findIndex((p) => p.id === product.id);
    if (index < 0) {
      this.context.commit('addContainerProductToState', product);
      return;
    }

    container.products.splice(index, 1, product);
    this.containerMapping.set(containerId, container);
  }

  @Mutation
  removeContainerProductFromState({ containerId, product }: ContainerProductParam) {
    const container = this.containerMapping.get(containerId);
    const index = container.products.findIndex((p) => p.id === product.id);
    if (index < 0) return;

    container.products.splice(index, 1);
    this.containerMapping.set(containerId, container);
  }

  @Action
  async addProduct(data: { container: Container, product:
      CreateProductRequest | Product, file?: File}) {
    let productToAdd = data.product;

    // If this is not an existing product yet we need to add it
    if (!('id' in data.product) || data.product.id == null) {
      let newProduct = await APIHelper.postResource('products', data.product);
      if (data.file) await setProductImage(newProduct.id, data.file);
      newProduct = await APIHelper.getResource(`products/${newProduct.id}`);
      productToAdd = ProductTransformer.makeProduct(newProduct) as Product;
      this.context.commit('ProductsModule/addProductToState', productToAdd, { root: true });
    }

    const containerResponse: Container = await APIHelper.getResource(`containers/${data.container.id}`);
    const products = containerResponse.products.map((p) => p.id);
    products.push((productToAdd as Product).id);
    const containerUpdate = {
      name: containerResponse.name,
      public: containerResponse.public,
      products,
    };
    await APIHelper.patchResource(`containers/${data.container.id}`, containerUpdate);
    this.context.commit('addContainerProductToState', { containerId: data.container.id, product: productToAdd });
  }

  @Action
  async removeProduct(data: {container: Container, product: UpdateProductRequest }) {
    const containerResponse: Container = await APIHelper.getResource(`containers/${data.container.id}`);
    const products = containerResponse.products.map((p) => p.id);
    const remaining = products.filter((p) => p !== data.product.id);
    const containerUpdate = {
      name: containerResponse.name,
      public: containerResponse.public,
      products: remaining,
    };
    await APIHelper.patchResource(`containers/${data.container.id}`, containerUpdate);
    this.context.commit('removeContainerProductFromState', { containerId: data.container.id, product: data.product });
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

  @Action
  async fetchContainerProducts(containerId: number) {
    const res = await getContainerProducts(containerId);
    this.context.commit('setContainerProducts', { containerId, products: res.records });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchPublicContainers(force: boolean = false) {
    if (this.publicContainers.length === 0 || force) {
      const res = await APIHelper.getResource('containers/public');
      const cntrs = res.records.map((cntr: any) => ContainerTransformer.makeContainer(cntr));
      this.context.commit('setPublicContainers', cntrs);
    }
  }
}
