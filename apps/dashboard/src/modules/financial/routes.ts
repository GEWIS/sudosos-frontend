import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import FineView from "@/modules/financial/views/FineView.vue";
import PayoutsView from "@/modules/financial/views/payouts/PayoutsView.vue";
import { UserRole } from "@/utils/rbacUtils";
import InvoiceOverview from "@/modules/financial/views/invoice/InvoiceOverview.vue";
import InvoiceInfoView from "@/modules/financial/views/invoice/InvoiceInfoView.vue";
import InvoiceCreateView from "@/modules/financial/views/invoice/InvoiceCreateView.vue";

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
          name: 'fines',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/invoice',
          component: InvoiceOverview,
          name: 'invoices',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/invoice/create',
          component: InvoiceCreateView,
          name: 'invoiceCreate',
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/invoice/:id',
          redirect: to => {
            const { id } = to.params;
            return `/invoice/${id}/info`;
          },
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/invoice/:id/info',
          name: 'invoiceInfo',
          component: InvoiceInfoView,
          props: true,
          meta: {
            requiresAuth: true,
            rolesAllowed: [UserRole.BAC_PM]
          }
        },
        {
          path: '/payout',
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
