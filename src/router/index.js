import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Transactions from '@/views/Transactions.vue';
import PointOfSale from '@/views/PointOfSale.vue';

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
    name: 'pointofsale',
    component: PointOfSale,
  },
];
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
export default router;
// # sourceMappingURL=index.js.map
