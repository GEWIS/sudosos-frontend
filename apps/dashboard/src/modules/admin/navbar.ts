import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { isAllowed } from '@/utils/permissionUtils';

export function useAdminNav() {
  const { t } = useI18n();
  const userStore = useUserStore();

  const user = computed(() => userStore.current.user);

  return computed(() =>
    [
      {
        label: t('common.navigation.admin'),
        visible:
          isAllowed('update', ['all'], 'User', ['any'], user.value) ||
          isAllowed('get', ['all'], 'Banner', ['any'], user.value),
        items: [
          {
            label: t('common.navigation.users'),
            route: '/user',
            visible: isAllowed('update', ['all'], 'User', ['any'], user.value),
          },
          {
            label: t('common.navigation.banners'),
            route: '/banner',
            visible: isAllowed('get', ['own'], 'Banner', ['any'], user.value),
          },
        ].filter((item) => item.visible),
      },
    ].filter((item) => item.visible),
  );
}
