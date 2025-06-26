<template>
  <CardComponent class="w-full" :header="t('modules.admin.userOverview.list.header')">
    <AdminUserTable
      :filters="filters"
      :is-active-filter="isActiveFilter"
      :is-loading="isLoading"
      :of-age-filter="ofAgeFilter"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      :search-query="searchQuery"
      :total-records="totalRecords"
      :user-types="userTypes"
      :users="sortedUsers"
      @filter="onFilter"
      @info="handleInfoPush"
      @page="onPage"
      @sort="onSort"
      @update:filters="(v) => (filters = v)"
      @update:is-active-filter="(v) => (isActiveFilter = v)"
      @update:of-age-filter="(v) => (ofAgeFilter = v)"
      @update:search-query="(v) => (searchQuery = v)"
    />

    <FormDialog
      v-model:model-value="showDialog"
      :form="form"
      :header="t('modules.admin.forms.user.header')"
      :is-editable="true"
    >
      <template #form="slotProps">
        <UserCreateForm
          v-model:is-visible="showDialog"
          :edit="true"
          :form="slotProps.form"
          @submit:success="showDialog = false"
        />
      </template>
    </FormDialog>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Fuse from 'fuse.js';
import { FilterMatchMode } from '@primevue/core/api';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { UserResponse } from '@sudosos/sudosos-client';

import apiService, { DEFAULT_PAGINATION_MAX } from '@/services/ApiService';
import router from '@/router';
import CardComponent from '@/components/CardComponent.vue';
import AdminUserTable from '@/modules/admin/components/users/AdminUserTable.vue';
import FormDialog from '@/components/FormDialog.vue';
import UserCreateForm from '@/modules/admin/components/users/forms/UserCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createUserSchema, userTypes } from '@/utils/validation-schema';
import type { DataTablePageEvent } from 'primevue/datatable';

const { t } = useI18n();
const userStore = useUserStore();

const showDialog = ref(false);
const form = schemaToForm(createUserSchema);

const searchQuery = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const isActiveFilter = ref(true);
const ofAgeFilter = ref(true);
const isLoading = ref(true);
const totalRecords = ref(0);
const allUsers = ref<UserResponse[]>([]);
const rows = 10;
const rowsPerPageOptions = [5, 10, 25, 50, 100];

const allUsersWithFullName = computed(() =>
  allUsers.value.map((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
  })),
);

function debounce<T extends (...args: never[]) => Promise<void>>(func: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      void func(...args);
    }, delay);
  };
}

async function apiCall(skip: number): Promise<void> {
  isLoading.value = true;
  try {
    const response = await apiService.user.getAllUsers(
      DEFAULT_PAGINATION_MAX,
      skip,
      searchQuery.value.split(' ')[0] || '',
      isActiveFilter.value ? isActiveFilter.value : undefined,
      ofAgeFilter.value,
      undefined,
      filters.value.type.value || undefined,
    );
    totalRecords.value = response.data._pagination.count || 0;
    allUsers.value = response.data.records;
  } finally {
    isLoading.value = false;
  }
}

const delayedAPICall = debounce(apiCall, 250);

function onPage(event: DataTablePageEvent) {
  delayedAPICall(event.first);
}
function onSort() {
  delayedAPICall(0);
}
function onFilter() {
  delayedAPICall(0);
}

watch(
  () => filters.value.global,
  () => delayedAPICall(0),
);
watch(searchQuery, () => delayedAPICall(0));

onMounted(() => {
  delayedAPICall(0);
});

const sortedUsers = computed(() => {
  if (!searchQuery.value.trim()) return allUsersWithFullName.value;
  return new Fuse(allUsersWithFullName.value, {
    keys: ['fullName'],
    isCaseSensitive: false,
    shouldSort: true,
    threshold: 0.2,
  })
    .search(searchQuery.value)
    .map((r) => r.item);
});

function handleInfoPush(userId: number) {
  const clickedUser: UserResponse | undefined = allUsers.value.find((record) => record.id == userId);
  if (clickedUser) userStore.addUser(clickedUser);
  const route = router.resolve({ name: 'user', params: { userId } });
  window.open(route.href, '_blank');
}
</script>
