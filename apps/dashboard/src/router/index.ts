import { createRouter, createWebHistory } from 'vue-router';
import POSOverviewView from '@/modules/point-of-sale/views/POSOverviewView.vue';
import POSInfoView from '@/modules/point-of-sale/views/POSInfoView.vue';
import POSCreateView from '@/modules/point-of-sale/views/POSCreateView.vue';
import POSEditView from '@/modules/point-of-sale/views/POSEditView.vue';
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import HomeView from '@/modules/home/views/HomeView.vue';
import LoginView from "@/modules/auth/views/AuthLoginView.vue";
import UserOverView from '@/modules/admin/views/AdminUserOverView.vue';
import SingleUserView from "@/views/SingleUserView.vue";
import BannersView from "@/modules/admin/views/AdminBannersView.vue";
import ProductsContainersView from "@/views/ProductsContainersView.vue";
import { isAuthenticated, useAuthStore } from "@sudosos/sudosos-frontend-common";
import PasswordResetView from "@/modules/auth/views/AuthResetView.vue";
import TransactionsView from "@/views/TransactionsView.vue";
import TermsOfServiceView from "@/modules/auth/views/AuthTermsOfServiceView.vue";
import { UserRole } from '@/utils/rbacUtils';
import 'vue-router';
import ErrorView from "@/views/ErrorView.vue";
import ProfileView from "@/views/ProfileView.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import LocalLoginView from "@/modules/auth/views/AuthLocalView.vue";
import LoginLayout from "@/modules/auth/layouts/AuthLayout.vue";
import { authRoutes } from "@/modules/auth/routes";
import { posRoutes } from "@/modules/point-of-sale/routes";
import { adminRoutes } from "@/modules/admin/routes";
import { financialRoutes } from "@/modules/financial/routes";

declare module 'vue-router' {
  interface RouteMeta {
    // must be declared by every route
    requiresAuth: boolean

    // Board
    isBoard?: boolean,

    // Seller
    isSeller?: boolean,

    // BAC
    isBAC?: boolean,
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '/error',
          component: ErrorView,
          name: 'error',
        },
      ]
    },
    ...authRoutes(),
    ...posRoutes(),
    ...adminRoutes(),
    ...financialRoutes(),
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          component: HomeView,
          name: 'home'
        },
        {
          path: '/user/:userId',
          component: SingleUserView,
          name: 'user',
          props: true,
        },
        {
          path: '/manage-products',
          component: ProductsContainersView,
          name: 'products-containers-overview',
          meta: { requiresAuth: true, isBAC: true }
        },
        {
          path: '/transactions',
          component: TransactionsView,
          name: 'transaction-view'
        },
        {
          path: '/error',
          component: ErrorView,
          name: 'error',
        },
        {
          path: '/profile',
          component: ProfileView,
          name: 'profile',
        },

        // Add other routes for authenticated users here
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isBoard = () => {
    return authStore.roles.includes(UserRole.BOARD);
  };

  const isBAC = () => {
    return authStore.roles.includes(UserRole.BAC);
  };

  const isSeller = () => {
    return authStore.roles.includes(UserRole.SELLER);
  };

  const hasTOSAccepted = () => {
    return authStore.acceptedToS || authStore.user?.acceptedToS;
  };

  const isAuth = isAuthenticated();

  if (to.meta?.requiresAuth && !isAuth) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    next({ name: 'login' });
  } else if (isAuth && hasTOSAccepted() == 'NOT_ACCEPTED' && to.name !== 'tos') {
    // If the user is authenticated but user hasn't accepted the TOS, always redirect to TOS
    next({ name: 'tos' });
  } else if (!to.meta?.requiresAuth && isAuth && hasTOSAccepted() == 'ACCEPTED') {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else {
    if(to.meta?.isBoard && !isBoard()) next({ name: 'home' });

    if(to.meta?.isSeller && !isSeller()) next({ name: 'home' });

    if(to.meta?.isBAC && !isBAC()) next({ name: 'home' });

    next();
  }
});

export default router;
