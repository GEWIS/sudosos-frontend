import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Transactions from '@/views/Transactions.vue';
import PointOfSale from '@/views/PointOfSale/PointOfSale.vue';
import PointOfSaleRequest from '@/views/PointOfSale/PointOfSaleRequest.vue';
import Saldo from '@/views/Saldo.vue';
import ManagePointOfSale from '@/views/Admin/ManagePointOfSale.vue';
import Screens from '@/views/Admin/Screens.vue';
import Advertisements from '@/views/Admin/Advertisements.vue';
import FlaggedTransactions from '@/views/BAC/FlaggedTransactions.vue';
import ManageProducts from '@/views/BAC/ManageProducts.vue';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: Transactions,
  },
  {
    path: '/point-of-sale',
    name: 'pointOfSale',
    component: PointOfSale,
  },
  {
    path: '/point-of-sale-request',
    name: 'pointOfSaleRequest',
    component: PointOfSaleRequest,
  },
  {
    path: '/saldo',
    name: 'saldo',
    component: Saldo,
  },
  {
    path: '/manage-pos',
    name: 'managePointOfSale',
    component: ManagePointOfSale,
  },
  {
    path: '/screens',
    name: 'screens',
    component: Screens,
  },
  {
    path: '/advertisements',
    name: 'advertisements',
    component: Advertisements,
  },
  {
    path: '/flagged-transactions',
    name: 'flaggedTransactions',
    component: FlaggedTransactions,
  },
  {
    path: '/manage-products',
    name: 'manageProducts',
    component: ManageProducts,
  },
];
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
export default router;
// # sourceMappingURL=index.js.map
