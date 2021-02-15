import Vue from 'vue';
import Vuex from 'vuex';

import ProductsModule from '@/store/modules/products';
import PointOfSaleModule from '@/store/modules/pointsofsale';
import ContainerModule from '@/store/modules/containers';
import FlaggedTransactionModule from '@/store/modules/flaggedtransaction';
import ProductCategoryModule from '@/store/modules/productcategory';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    productState: ProductsModule,
    pointOfSaleState: PointOfSaleModule,
    containerState: ContainerModule,
    flaggedTransactionState: FlaggedTransactionModule,
    productCategoryState: ProductCategoryModule,
  },
});
