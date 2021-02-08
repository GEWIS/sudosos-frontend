import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Saldo from '@/views/Saldo.vue';
import Transactions from '@/views/Transactions.vue';
import PointOfSaleOverview from '@/views/PointOfSale/PointOfSaleOverview.vue';
import PointOfSaleApprove from '@/views/PointOfSale/PointOfSaleApprove.vue';
import PointOfSaleRequest from '@/views/PointOfSale/PointOfSaleRequest.vue';
import ManagePointOfSale from '@/views/Admin/ManagePointOfSale.vue';
import Screens from '@/views/Admin/Screens.vue';
import Banners from '@/views/Admin/Banners.vue';
import FlaggedTransactions from '@/views/BAC/FlaggedTransactions.vue';
import ManageProducts from '@/views/BAC/ManageProducts.vue';
import Profile from '@/views/User/Profile.vue';
import FlaggedTransactionDetails from '@/views/BAC/FlaggedTransactionDetails.vue';
import PointOfSaleInfo from '@/views/PointOfSale/PointOfSaleInfo.vue';
import SignOut from '@/views/User/SignOut.vue';
import BorrelkaartOverview from '@/views/BAC/Borrelkaarten.vue';
import BorrelkaartenPrint from '@/views/BAC/BorrelkaartenPrint.vue';

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
    path: '/saldo',
    name: 'saldo',
    component: Saldo,
  },
  {
    path: '/point-of-sale-overview',
    name: 'pointOfSale',
    component: PointOfSaleOverview,
  },
  {
    path: '/point-of-sale-request',
    name: 'pointOfSaleRequest',
    component: PointOfSaleRequest,
  },
  {
    path: '/point-of-sale/approve/:id',
    name: 'pointOfSaleApprove',
    component: PointOfSaleApprove,
    props: true,
  },
  {
    path: '/point-of-sale/info/:id',
    name: 'pointOfSaleInfo',
    component: PointOfSaleInfo,
    props: true,
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
    path: '/banners',
    name: 'banners',
    component: Banners,
  },
  {
    path: '/flagged-transactions',
    name: 'flaggedTransactions',
    component: FlaggedTransactions,
  },
  {
    path: '/flagged-transactions/flag/:id',
    name: 'flaggedTransactionDetails',
    component: FlaggedTransactionDetails,
    props: true,
  },
  {
    path: '/manage-products',
    name: 'manageProducts',
    component: ManageProducts,
  },
  {
    path: '/borrelkaart-overview',
    name: 'borrelkaartOverview',
    component: BorrelkaartOverview,
  },
  {
    path: '/borrelkaarten-overview/cards/:id',
    name: 'borrelkaartenPrint',
    component: BorrelkaartenPrint,
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
  },
  {
    path: '/sign-out',
    name: 'signOut',
    component: SignOut,
  },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
