import { defineStore } from 'pinia';
import type {
  CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse,
  UpdateProductRequest,
  VatGroupResponse
} from '@sudosos/sudosos-client';
import { fetchAllPages } from '@sudosos/sudosos-frontend-common';
import ApiService from "@/services/ApiService";
import { useContainerStore } from "@/stores/container.store";

export const useProductStore = defineStore('products', {
  state: () => ({
    products: {} as Record<number, ProductResponse>,
    categories: [] as ProductCategoryResponse[],
    vatGroups: [] as VatGroupResponse[],
  }),
  actions: {
    // Use this function in on before loads to ensure the readiness of the store.
    async fetchAllIfEmpty() {
      if (Object.keys(this.products).length === 0) {
        await this.fetchAllProducts();
      }
      if (this.categories.length === 0) {
        await this.fetchAllCategories();
      }
      if (this.vatGroups.length === 0) {
        await this.fetchAllVatGroups();
      }
    },
    async fetchAllProducts() {
      const productsArray = await fetchAllPages<ProductResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.products.getAllProducts(take, skip)
      );
      this.products = {};
      for (const product of productsArray) {
        this.products[product.id] = product;
      }
    },
    async fetchAllCategories() {
      this.categories = await fetchAllPages<ProductCategoryResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.category.getAllProductCategories(take, skip)
      );
    },
    async fetchAllVatGroups() {
      this.vatGroups = await fetchAllPages<VatGroupResponse>(
        0,
        Number.MAX_SAFE_INTEGER,
        // @ts-ignore
        (take, skip) => ApiService.vatGroups.getAllVatGroups(undefined, undefined,undefined, false, take, skip));
    },
    async updateProductImage(id: number, productImage: File) {
      await ApiService.products.updateProductImage(id, productImage).then(async () => {
        const product = this.products[id];
        if (!product) return;
        product.image = URL.createObjectURL(productImage);
        this.products[product.id] = product;
        await (useContainerStore()).handleProductUpdate(product);
      });
    },
    async createProduct(createProductRequest: CreateProductRequest, productImage: File | undefined) {
      const product = await ApiService.products.createProduct(createProductRequest).then((resp) => resp.data);
      if (productImage) {
        await this.updateProductImage(product.id, productImage);
        // Ensure image is loaded
        product.image = URL.createObjectURL(productImage);
        console.error(product.image);
      }
      this.products[product.id] = product;
      return product;
    },
    async updateProduct(productId: number, updateProductRequest: UpdateProductRequest): Promise<ProductResponse> {
      const product = await ApiService.products
        .updateProduct(productId, updateProductRequest).then((resp) => resp.data);
      this.products[product.id] = product;
      await (useContainerStore()).handleProductUpdate(product);
      return product;
    },
    async fetchProduct(id: number) {
      const product = await ApiService.products.getSingleProduct(id).then((resp) => resp.data);
      this.products[product.id] = product;
    },
    async addProduct(product: ProductResponse) {
      this.products[product.id] = product;
    }
  },
  getters: {
    getProducts(): Record<string, ProductResponse> {
      return this.products;
    },
    getSingleProduct: (state) => (id: number): ProductResponse | null => {
      return state.products[id] || null;
    }
  }
});
