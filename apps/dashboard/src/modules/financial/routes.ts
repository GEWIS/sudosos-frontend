import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import PayoutsView from "@/modules/financial/views/payouts/PayoutsView.vue";
import { UserRole } from "@/utils/rbacUtils";

export function financialRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
        path: '/fine',
        component: FineView,
        name: 'fine',
        meta: {
          requiresAuth: true,
          rolesAllowed: [UserRole.BAC_PM]
        }
      },
        {
          path: '/payouts',
          component: PayoutsView,
          name: 'payouts',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        }
      ]
    }
  ];
}
