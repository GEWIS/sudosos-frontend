import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import apiService from '@/services/ApiService';
import { isAllowed } from '@/utils/permissionUtils';

type OrganNotificationMap = Record<number, string>;

export function useSellerNav() {
  const { t } = useI18n();
  const authStore = useAuthStore();

  // Reactive notification mapping
  const organNotifications = ref<OrganNotificationMap>({});

  // Fetch balances in the background, only update notifications
  async function fetchOrgansNotifications() {
    const notifications: OrganNotificationMap = {};
    await Promise.all(
      authStore.organs.map(async (organ) => {
        const res = await apiService.balance.getBalanceId(organ.id);
        notifications[organ.id] = res.data.amount.amount > 0 ? ' ' : '';
      }),
    );
    organNotifications.value = notifications;
  }

  // Start loading in the background after mount
  onMounted(fetchOrgansNotifications);

  return computed(() => [
    {
      label: t('common.navigation.seller'),
      items: [
        {
          label: t('common.navigation.productsContainers'),
          route: '/product',
          visible: isAllowed('get', ['own', 'organ'], 'Product', ['any']),
        },
        {
          label: t('common.navigation.pos'),
          route: '/point-of-sale',
          visible: isAllowed('update', ['own', 'organ'], 'PointOfSale', ['any']),
        },
        ...authStore.organs.map((organ) => ({
          label: `${organ.firstName} ${organ.lastName}`,
          route: '/user/' + organ.id,
          notifications: organNotifications.value[organ.id] || undefined,
        })),
      ].filter((item) => item.visible !== false),
    },
  ]);
}
