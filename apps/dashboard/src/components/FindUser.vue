<template>
  <Dropdown
      v-model="selectedUser"
      :options="users"
      optionLabel="fullName"
      :loading="loading"
      :filter="true"
      autoFilterFocus
      :filter-fields="['fullName']"
      :placeholder="placeholder"
      class="w-full md:w-15rem"
      @filter="filterUsers"
  >
  <template #option="slotProps">
    {{ slotProps.option.fullName }} {{ slotProps.option.gewisId ? `(${slotProps.option.gewisId})` : '' }}
  </template>
  </Dropdown>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from "vue";
import type { Ref } from "vue";
import apiService from "@/services/ApiService";
import { debounce } from "lodash";
import { type BaseUserResponse, GetAllUsersTypeEnum, type UserResponse } from "@sudosos/sudosos-client";
import { useUserStore } from "@sudosos/sudosos-frontend-common";

const emits = defineEmits(['update:value']);

const props = defineProps({
  value: {
    type: Object as PropType<UserResponse>,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  type: {
    type: String as PropType<GetAllUsersTypeEnum>,
    required: false,
    default: undefined
  },
  take: {
    type: Number,
    required: false,
    default: 10,
  },
  showPositive: {
    type: Boolean,
    required: false,
    default: true
  }
});

const lastQuery = ref("");
const selectedUser = ref(null);
const userStore = useUserStore();

const loading = ref(false);
const users: Ref<(BaseUserResponse & { fullName: string })[]> = ref([]);

const transformUsers = (userData: BaseUserResponse[]) => {
  let usersData = userData;
  if (!props.showPositive){
    usersData = userData.filter(isNegative);
  }
  return usersData.map((user: BaseUserResponse) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }));
};

const debouncedSearch = debounce((e: any) => {
  loading.value = true;
  apiService.user.getAllUsers(props.take, 0, e.value, undefined, undefined, undefined, props.type).then((res) => {
    users.value = transformUsers(res.data.records);
  }).finally(() => {
    loading.value = false;
  });
  lastQuery.value = e.value;
}, 500);

const filterUsers = (e: any) => {
  if (e.value.split(' ')[0] !== lastQuery.value) {
    if (e.value.length < 3) return;
    debouncedSearch(e);
  }
};

function isNegative(user: BaseUserResponse) {
  return userStore.getBalanceById(user.id).amount.amount < 0;
}

onMounted(async () => {
  apiService.user.getAllUsers(props.take, 0, undefined, undefined, undefined, undefined, props.type).then((res) => {
    userStore.addUsers(res.data.records);
    userStore.fetchUserBalances(res.data.records, apiService).then(() => {
      users.value = transformUsers(res.data.records);
    });
  });
});

watch(selectedUser, () => {
  emits('update:value', selectedUser.value);
});
</script>

<style scoped lang="scss">

</style>
