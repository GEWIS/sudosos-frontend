import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import ProductsContainersView from "@/modules/seller/views/ProductsContainersView.vue";
import { UserRole } from "@/utils/rbacUtils";
import POSOverviewView from "@/modules/seller/views/POSOverviewView.vue";
import POSInfoView from "@/modules/seller/views/POSInfoView.vue";
import POSCreateView from "@/modules/seller/views/POSCreateView.vue";
import POSEditView from "@/modules/seller/views/POSEditView.vue";

export function sellerRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/manage-products',
          component: ProductsContainersView,
          name: 'products-containers-overview',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
        {
          path: '/point-of-sale/overview',
          name: 'pointOfSale',
          component: POSOverviewView,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
        {
          path: '/point-of-sale/info/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
        {
          path: '/point-of-sale/request',
          name: 'pointOfSaleCreate',
          component: POSCreateView,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
        {
          path: '/point-of-sale/edit/:id',
          name: 'pointOfSaleEdit',
          component: POSEditView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.SELLER]
          }
        },
      ]
    }
  ];
}
