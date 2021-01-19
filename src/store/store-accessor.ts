/* eslint-disable import/no-mutable-exports */

// This is the "store accessor":
// It initializes all the modules using a Vuex plugin (see store/index.ts)
// In here you import all your modules, call getModule on them to turn them
// into the actual stores, and then re-export them.

import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import ProductsModule from '@/store/modules/products';
import UserModule from '@/store/modules/user';
import BannerModule from '@/store/modules/banners';
import TransactionModule from '@/store/modules/transactions';
import PointOfSaleModule from '@/store/modules/pointsofsale';
import ContainerModule from '@/store/modules/containers';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';
import TransferModule from '@/store/modules/transfers';
import BorrelkaartGroupModule from '@/store/modules/borrelkaartgroup';
import ProductCategoryModule from '@/store/modules/productcategory';

// Each store is the singleton instance of its module class
// Use these -- they have methods for state/getters/mutations/actions
// (result from getModule(...))
export let productStore: ProductsModule;
export let userStore: UserModule;
export let bannerStore: BannerModule;
export let transactionStore: TransactionModule;
export let pointOfSaleStore: PointOfSaleModule;
export let containerStore: ContainerModule;
export let flaggedTransactionStore: FlaggedTransactionModule;
export let transferStore: TransferModule;
export let borrelkaartGroupStore: BorrelkaartGroupModule;
export let productCategoryStore: ProductCategoryModule;

// initializer plugin: sets up state/getters/mutations/actions for each store
export function initializeStores(store: Store<any>): void {
  productStore = getModule(ProductsModule, store);
  userStore = getModule(UserModule, store);
  bannerStore = getModule(BannerModule, store);
  transactionStore = getModule(TransactionModule, store);
  pointOfSaleStore = getModule(PointOfSaleModule, store);
  containerStore = getModule(ContainerModule, store);
  flaggedTransactionStore = getModule(FlaggedTransactionModule, store);
  transferStore = getModule(TransferModule, store);
  borrelkaartGroupStore = getModule(BorrelkaartGroupModule, store);
  productCategoryStore = getModule(ProductCategoryModule, store);
}

// for use in 'modules' store init (see store/index.ts), so each module
// appears as an element of the root store's state.
// (This is required!)

export const modules = {
  products: ProductsModule,
  user: UserModule,
  banners: BannerModule,
  transactions: TransactionModule,
  pointOfSale: PointOfSaleModule,
  container: ContainerModule,
  flaggedTransaction: FlaggedTransactionModule,
  transfer: TransferModule,
  borrelkaartGroup: BorrelkaartGroupModule,
  productCategory: ProductCategoryModule,
};
