import {
  Action, Module, Mutation, VuexModule,
} from 'vuex-module-decorators';
import store from '@/store';
import APIHelper from '@/mixins/APIHelper';
import { CreateProductRequest, Product, UpdateProductRequest } from '@/entities/Product';
import { Container, UpdateContainerRequest } from '@/entities/Container';
import ProductTransformer from '@/transformers/ProductTransformer';
import { setProductImage } from '@/api/products';
import {
  deleteContainer, getAllContainers, getAllPublicContainers,
  getContainer,
  getContainerProducts, patchContainer,
  postContainer,
} from '@/api/containers';
import { Dictionary, getItems } from '@/store/dictionary';
import Vue from 'vue';

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
  containerDict: Dictionary<Container> = {};

  get containers() {
    return getItems(this.containerDict);
  }

  publicContainerDict: Dictionary<Container> = {};

  get publicContainers() {
    return getItems(this.publicContainerDict);
  }

  @Mutation
  reset() {
    this.containerDict = {};
    this.publicContainerDict = {};
  }

  @Mutation
  setContainers(containers: Container[]) {
    containers.forEach((c) => {
      Vue.set(this.containerDict, c.id, c);
    });
  }

  @Mutation
  setPublicContainers(containers: Container[]) {
    containers.forEach((c) => {
      Vue.set(this.publicContainerDict, c.id, c);
    });
  }

  @Action
  async addContainer(container: any) {
    return postContainer(container).then((c) => {
      this.context.commit('setContainers', [c]);
      return c;
    });
  }

  @Action
  async updateContainer(update: {container: UpdateContainerRequest, id: number}) {
    return patchContainer(update.id, update.container).then((c) => {
      this.context.commit('setContainers', [c]);
      return c;
    });
  }

  @Mutation
  setContainerProducts({ containerId, products }: ContainerProductsParam) {
    const container = this.containerDict[containerId];
    container.products = products;
  }

  @Mutation
  addContainerProductToState({ containerId, product }: ContainerProductParam) {
    const container = this.containerDict[containerId];
    container.products.push(product);
  }

  @Mutation
  updateContainerProductInAllContainers(product: Product) {
    const containersContainingProduct = Array.from(getItems(this.containerDict))
      .filter((c) => c.products.map((p) => p.id).includes(product.id));
    containersContainingProduct.forEach((container) => {
      const index = container.products.findIndex((p) => p.id === product.id);
      if (index < 0) {
        this.context.commit('addContainerProductToState', product);
        return;
      }

      container.products.splice(index, 1, product);
    });
  }

  @Mutation
  updateContainerProductInState({ containerId, product }: ContainerProductParam) {
    const container = this.containerDict[containerId];
    const index = container.products.findIndex((p) => p.id === product.id);
    if (index < 0) {
      this.context.commit('addContainerProductToState', product);
      return;
    }

    container.products.splice(index, 1, product);
  }

  @Mutation
  removeContainerProductFromState({ containerId, product }: ContainerProductParam) {
    const container = this.containerDict[containerId];
    const index = container.products.findIndex((p) => p.id === product.id);
    if (index < 0) return;

    container.products.splice(index, 1);
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

    const containerResponse: Container = await getContainer(data.container.id) as Container;
    const products = containerResponse.products.map((p) => p.id);
    products.push((productToAdd as Product).id);
    const containerUpdate: UpdateContainerRequest = {
      name: containerResponse.name,
      public: containerResponse.public,
      products,
    };
    await patchContainer(data.container.id, containerUpdate);
    this.context.commit('addContainerProductToState', { containerId: data.container.id, product: productToAdd });
  }

  @Action
  async removeProduct(data: {container: Container, product: UpdateProductRequest }) {
    const containerResponse: Container = await getContainer(data.container.id) as Container;
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
    deleteContainer(containerId);
    delete this.containerDict[containerId];
  }

  // @Mutation
  // updateContainer(container: any) {
  //   const response = APIHelper.putResource('containers', container);
  //   const containerResponse = ContainerTransformer.makeContainer(response) as Container;
  //   this.containerMapping.set(containerResponse.id, containerResponse);
  // }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchContainers(force: boolean = false) {
    if (Object.keys(this.containerDict).length === 0 || force) {
      const cntrs = await getAllContainers();
      this.context.commit('setContainers', cntrs);
    }
  }

  @Action
  async fetchContainerProducts(containerId: number) {
    const res = await getContainerProducts(containerId);
    this.context.commit('setContainerProducts', { containerId, products: res });
  }

  @Action({
    rawError: (process.env.VUE_APP_DEBUG_STORES === 'true'),
  })
  async fetchPublicContainers(force: boolean = false) {
    if (Object.keys(this.publicContainerDict).length === 0 || force) {
      const cntrs = await getAllPublicContainers();
      this.context.commit('setPublicContainers', cntrs);
    }
  }
}
