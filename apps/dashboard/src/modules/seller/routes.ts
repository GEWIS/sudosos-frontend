import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import ProductsContainersView from "@/modules/seller/views/ProductsContainersView.vue";
import { UserRole } from "@/utils/rbacUtils";
import POSOverviewView from "@/modules/seller/views/POSOverviewView.vue";
import POSInfoView from "@/modules/seller/views/POSInfoView.vue";
import SellerPayoutsView from "@/modules/seller/views/SellerPayoutsView.vue";
import { isAllowed } from "@/utils/permissionUtils";

export function sellerRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/sellers/:id/payouts',
          name: 'sellerPayouts',
          component: SellerPayoutsView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER],
            isAllowed: isAllowed('get', ['own', 'organ'], 'SellerPayout', ['any'])
          }
        },
        {
          path: '/manage-products',
          component: ProductsContainersView,
          name: 'products-containers-overview',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER],
            isAllowed: isAllowed('get', ['own', 'organ'], 'Products', ['any'])
          }
        },
        {
          path: '/point-of-sale/overview',
          name: 'pointOfSale',
          component: POSOverviewView,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER],
            isAllowed: isAllowed('get', ['own', 'organ'], 'PointOfSale', ['any'])
          }
        },
        {
          path: '/point-of-sale/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER],
            isAllowed: isAllowed('get', ['own', 'organ'], 'PointOfSale', ['any'])
          }
        }
      ]
    }
  ];
}
