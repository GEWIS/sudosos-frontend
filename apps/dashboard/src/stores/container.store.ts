import { defineStore } from "pinia";
import type {
    ContainerResponse,
    ContainerWithProductsResponse,
    ProductResponse,
    UpdateContainerRequest
} from "@sudosos/sudosos-client";
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from "@/services/ApiService";

export type ContainerInStore = ContainerWithProductsResponse | ContainerResponse;

export function isContainerWithProductsResponse(container: ContainerInStore):
  container is ContainerWithProductsResponse {
    return (container as ContainerWithProductsResponse).products !== undefined;
}

export const useContainerStore = defineStore('container', {
    state: () => ({
        containers: {} as Record<number, ContainerInStore>,
    }),
    getters: {
        getContainer: (state) => (c: ContainerResponse): ContainerInStore | null => {
            return state.containers[c.id] || null;
        },
        getAllContainers(state): Record<number, ContainerInStore> {
            return state.containers;
        },
        getPublicContainers(state): Record<number, ContainerInStore> {
            return Object.fromEntries(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              Object.entries(state.containers).filter(([_, container]) => container.public)
            );
        },
        getUsersContainers(state): Record<number, ContainerInStore> {
            return Object.fromEntries(
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              Object.entries(state.containers).filter(([_, container]) => container.public === false)
            );
        }
    },
    actions: {
        async fetchAllIfEmpty() {
          if (Object.keys(this.containers).length === 0) {
            await this.fetchAllContainers();
          }
        },
        async fetchContainer(id: number) {
            const resp = await ApiService.container.getSingleContainer(id);
            this.containers[id] = resp.data;
        },
        async fetchAllContainers() {
            const containersArray = await fetchAllPages<ContainerWithProductsResponse>(
              0,
              Number.MAX_SAFE_INTEGER,
              // @ts-ignore
              (take, skip) => ApiService.container.getAllContainers(take, skip)
            );
            containersArray.forEach((container: ContainerWithProductsResponse) => {
                this.containers[container.id] = container;
            });
        },
        async addProductToContainer(c: ContainerResponse, product: ProductResponse) {
            const container = this.containers[c.id];
            if (!container) {
                throw new Error(`Container with id ${c.id} not found`);
            }

            if (!isContainerWithProductsResponse(container)) {
                throw new Error(`Container with id ${c.id} does not have products loaded`);
            }

            const updateContainerReq: UpdateContainerRequest = {
                name: container.name,
                products: [product.id, ...container.products.map(e => e.id)],
                public: container.public || false,
            };

            container.products.push(product);
            return ApiService.container.updateContainer(container.id, updateContainerReq);
        },
        async deleteProductFromContainer(c: ContainerResponse, product: ProductResponse) {
            const container = this.containers[c.id];
            if (!container) {
                throw new Error(`Container with id ${c.id} not found`);
            }

            if (!isContainerWithProductsResponse(container)) {
                throw new Error(`Container with id ${c.id} does not have products loaded`);
            }

            const updateContainerReq: UpdateContainerRequest = {
                name: container.name,
                products: container.products.filter(e => e.id !== product.id).map(e => e.id),
                public: container.public || false,
            };

            container.products = container.products.filter(e => e.id !== product.id);
            return ApiService.container.updateContainer(container.id, updateContainerReq);
        },
        async handleProductUpdate(productResponse: ProductResponse) {
            const containers = Object.values(this.containers).filter(isContainerWithProductsResponse);
            for (const container of containers) {
                const productIndex = container.products.findIndex(p => p.id === productResponse.id);
                if (productIndex !== -1) {
                    container.products[productIndex] = productResponse;
                }
            }
        },
        async createEmptyContainer(name: string, isPublic: boolean, ownerId: number) {
            const response = await ApiService.container.createContainer(
              { name: name, products: [], public: isPublic, ownerId: ownerId });
            const container = response.data;

            this.containers[container.id] = container;

            return container;
        },
        async getContainerWithProducts(c: ContainerResponse, force: boolean = false):
          Promise<ContainerWithProductsResponse | null> {
            let container = this.containers[c.id];

            if (!container) {
                // Fetch container if not already in state
                const resp = await ApiService.container.getSingleContainer(c.id);
                container = resp.data;
                this.containers[c.id] = container;
            }

            if (force || (container && (!isContainerWithProductsResponse(container)))) {
                // Fetch products for the container if not already present or if force is true
                const products = await fetchAllPages<ProductResponse>(
                  0,
                  Number.MAX_SAFE_INTEGER,
                  // @ts-ignore
                  (take, skip) => ApiService.container.getProductsContainer(c.id, take, skip)
                );
                // Ensure reactivity by creating a new container object
                this.containers[c.id] = { ...container, products };
            }

            return this.containers[c.id] as ContainerWithProductsResponse;
        }
    }
});
