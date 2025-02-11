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
  <template #option="slotProps" >
    <span :class="{'text-gray-500': isNegative(slotProps.option) === true}">
      {{ slotProps.option.fullName }} {{ slotProps.option.gewisId ? `(${slotProps.option.gewisId})` : '' }}
    </span>
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

const emits = defineEmits(['update:user']);

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
  },
  default: {
    type: Object as PropType<BaseUserResponse>,
    required: false,
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
const selectedUser: Ref<BaseUserResponse | undefined> = ref(undefined);
const userStore = useUserStore();

const loading = ref(false);
const users: Ref<(BaseUserResponse & { fullName: string })[]> = ref([]);

const compareBalance = (a: BaseUserResponse, b: BaseUserResponse) => {
  const isANegative = isNegative(a);
  const isBNegative = isNegative(b);

  if (isANegative && !isBNegative) {
    return -1;
  }
  if (!isANegative && isBNegative) {
    return 1;
  }
  return 0;
};

const transformUsers = (userData: BaseUserResponse[]) => {
  const usersData: (BaseUserResponse & { fullName: string})[]
      = userData.map((user) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }));

  usersData.sort((a, b) => {
    if (!props.showPositive) {
      const res = compareBalance(a, b);
      if (res !== 0) return res;
    }
    return a.fullName.localeCompare(b.fullName);
  });
  return usersData;
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
  const balance = userStore.getBalanceById(user.id);
  if (!balance) return undefined;
  else return balance.amount.amount < 0;
}

onMounted(async () => {
  apiService.user.getAllUsers(props.take, 0, undefined, undefined, undefined, undefined, props.type).then((res) => {
    userStore.addUsers(res.data.records);
    let selected = undefined;
    if (props.default) {
      selected = transformUsers([props.default])[0];
    }
    userStore.fetchUserBalances(res.data.records, apiService).then(() => {
      const transformed = transformUsers(res.data.records);
      if (selected) {
        users.value = [...transformed, selected];
        selectedUser.value = selected;
      } else {
        users.value = transformed;
      }
    });
  });
});

watch(selectedUser, () => {
  emits('update:user', selectedUser.value);
});

</script>

<style scoped lang="scss">

</style>
