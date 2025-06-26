<template>
  <nav class="flex justify-around w-full navbar-background">
    <NavbarMenu menu-class="hidden lg:flex" :model="navItems">
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-16 py-2" src="@/assets/img/gewis-branding.svg" />
        </router-link>
      </template>
      <!-- You can override #item slot here if needed -->
    </NavbarMenu>
    <NavbarMenu menu-class="hidden lg:flex" :model="profileItems">
      <template #start>
        <img v-if="isAdmin" alt="beer" class="h-4" src="@/assets/img/bier.png" />
      </template>
    </NavbarMenu>
    <NavbarMenu
      menu-class="flex flex-row flex-wrap justify-between lg:hidden mx-2 my-4 transition-all w-full"
      :model="mobileItems"
    >
      <template #start>
        <router-link class="items-center flex flex-row font-bold no-underline py-1 text-white" to="/">
          {{ t('common.sudosos') }}
          <img alt="SudoSOS" class="h-4 py-2" src="@/assets/img/gewis-branding.svg" />
        </router-link>
      </template>
    </NavbarMenu>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@/utils/permissionUtils';
import { useDarkMode } from '@/composables/darkMode';
import { useAdminNav } from '@/modules/admin/navbar';
import { useFinancialNav } from '@/modules/financial/navbar';
import { useSellerNav } from '@/modules/seller/navbar';
import NavbarMenu from '@/components/NavbarMenu.vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n();
const { isDark, toggle } = useDarkMode();

const firstName = computed((): string | undefined => {
  return userStore.getCurrentUser.user ? userStore.getCurrentUser.user.firstName : undefined;
});

const handleLogout = () => {
  authStore.logout();
  void router.push('/');
};

// If you can override maintenance mode, you are an admin
const isAdmin = computed(() => isAllowed('override', ['all'], 'Maintenance', ['any']));

const adminNav = useAdminNav();
const financialNav = useFinancialNav();
const sellerNav = useSellerNav();

const navItems = computed(() => [
  {
    label: t('common.navigation.transactions'),
    route: '/transaction',
  },
  ...adminNav.value,
  ...financialNav.value,
  ...sellerNav.value,
]);

const profileItems = computed(() => [
  {
    label: firstName.value,
    items: [
      {
        label: t('common.navigation.profile'),
        route: '/profile',
      },
      {
        label: t('common.navigation.signOut'),
        command: handleLogout,
      },
    ],
  },
  {
    label: '',
    icon: 'pi pi-globe',
    items: [
      {
        label: t('common.navigation.dutch'),
        disabled: () => locale.value == 'nl',
        command: () => {
          locale.value = 'nl';
          localStorage.setItem('locale', 'nl');
        },
      },
      {
        label: t('common.navigation.english'),
        disabled: () => locale.value == 'en',
        command: () => {
          locale.value = 'en';
          localStorage.setItem('locale', 'en');
        },
      },
    ],
  },
  {
    label: '',
    aria: 'toggle dark mode',
    command: toggle,
    icon: isDark.value ? 'pi pi-sun' : 'pi pi-moon',
  },
]);

const mobileItems = computed(() => [...navItems.value, ...profileItems.value]);
</script>

<style scoped lang="scss">
@media screen and (min-width: 1000px) {
  .mb\:hidden {
    display: none !important;
  }
  .mb\:flex {
    display: flex !important;
  }
}

.navbar-background {
  background-color: var(--p-menubar-background);
}
</style>
