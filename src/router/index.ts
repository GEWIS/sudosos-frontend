import Vue from 'vue';
import VueRouter from 'vue-router';

import Public from '@/layout/Public.vue';
import Dashboard from '@/layout/Dashboard.vue';

import Home from '@/views/Home.vue';
import Saldo from '@/views/Saldo.vue';
import Transactions from '@/views/Transactions.vue';
import PointOfSaleOverview from '@/views/PointOfSale/PointOfSaleOverview.vue';
import PointOfSaleApprove from '@/views/PointOfSale/PointOfSaleApprove.vue';
import PointOfSaleRequest from '@/views/PointOfSale/PointOfSaleCreate.vue';
import ManagePointOfSale from '@/views/Admin/ManagePointOfSale.vue';
import Screens from '@/views/Admin/Screens.vue';
import Banners from '@/views/Admin/Banners.vue';
import FlaggedTransactions from '@/views/BAC/FlaggedTransactions.vue';
import ManageProducts from '@/views/BAC/ManageProducts.vue';
import Profile from '@/views/User/Profile.vue';
import FlaggedTransactionDetails from '@/views/BAC/FlaggedTransactionDetails.vue';
import PointOfSaleInfo from '@/views/PointOfSale/PointOfSaleInfo.vue';
import BorrelkaartOverview from '@/views/BAC/Borrelkaarten.vue';
import BorrelkaartenPrint from '@/views/BAC/BorrelkaartenPrint.vue';
import TransactionEditPage from '@/views/BAC/TransactionEditPage.vue';
import UserOverview from '@/views/BAC/UserOverview.vue';
import UserDetails from '@/views/BAC/UserDetails.vue';
import Login from '@/views/Login.vue';
import APIHelper from '@/mixins/APIHelper';
import Logout from '@/mixins/Logout';
import PointOfSaleEdit from '@/views/PointOfSale/PointOfSaleEdit.vue';

Vue.use(VueRouter);

const routes = [

  {
    path: '',
    component: Public,
    children: [
      {
        path: '/login',
        component: Login,
        name: 'login',
      },
    ],
  },
  {
    path: '',
    component: Dashboard,
    children: [
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
        path: '/point-of-sale/overview',
        name: 'pointOfSale',
        component: PointOfSaleOverview,
      },
      {
        path: '/point-of-sale/request',
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
        path: '/point-of-sale/edit/:id',
        name: 'pointOfSaleEdit',
        component: PointOfSaleEdit,
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
        path: '/user-overview',
        name: 'userOverview',
        component: UserOverview,
      },
      {
        path: '/user-details/user/:id',
        name: 'userDetails',
        component: UserDetails,
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
        props: true,
      },
      {
        path: '/transaction/:id',
        name: 'transactionEditPage',
        component: TransactionEditPage,
        props: true,
      },
      {
        path: '/profile',
        name: 'profile',
        component: Profile,
      },
    ],
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

let previousFrom: string | null | undefined = null;

router.beforeEach((to, from, next) => {
  const token = APIHelper.getToken();
  const notToLogin = to.name !== 'login';
  const jwtIsNull = token.jwtToken === undefined;
  const jwtIsExpired = new Date(Number(token.jwtExpires)) < new Date();

  // if (from.name === previousFrom && to.name !== 'login') {
  //   console.warn('previousFrom');
  //   Logout.logout(next);
  //   return;
  // }

  previousFrom = from.name;

  if ((notToLogin && jwtIsNull) || (!jwtIsNull && jwtIsExpired)) {
    Logout.logout(next);
  } else {
    next();
  }
});

export default router;
