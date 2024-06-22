import type { RouteRecordRaw } from "vue-router";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import UserOverView from "@/modules/admin/views/AdminUserOverView.vue";
import BannersView from "@/modules/admin/views/AdminBannersView.vue";

export function adminRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/user-overview',
          name: 'userOverview',
          component: UserOverView,
          meta: { requiresAuth: true, isBAC: true, isBoard: true }
        },
        {
          path: '/banners',
          component: BannersView,
          name: 'banners',
          meta: { requiresAuth: true, isBoard: true }
        },
      ],
    }
  ];
}
