<template>
  selected: {{ selectedUser }}
  <Dropdown
      v-model="selectedUser"
      :options="users.concat(defaultUser)"
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
import {onBeforeMount, onMounted, type PropType, ref, watch} from "vue";
import type { Ref } from "vue";
import apiService from "@/services/ApiService";
import { debounce } from "lodash";
import type { BaseUserResponse, UserResponse } from "@sudosos/sudosos-client";

const lastQuery = ref("");
const selectedUser: Ref<UserResponse | undefined> = ref(undefined);
const loading = ref(false);

const users: Ref<(BaseUserResponse & { fullName: string })[]> = ref([]);
const emits = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Object as PropType<UserResponse>,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
});

const transformUsers = (userData: BaseUserResponse[]) => {
  return userData.map((user: BaseUserResponse) => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`
  }));
};

const debouncedSearch = debounce((e: any) => {
  loading.value = true;
  apiService.user.getAllUsers(50, 0, e.value).then((res) => {
    users.value = transformUsers(res.data.records); // Transform users
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

const defaultUser: Ref<Array<BaseUserResponse & { fullName: string }>> = ref([]);

onBeforeMount(() => {
  if (props.modelValue) {
    defaultUser.value = transformUsers([props.modelValue]);
  }
});

watch(
    () => props.modelValue,
    (newValue) => {
      selectedUser.value = newValue;
    }
);

onMounted(async () => {
  apiService.user.getAllUsers(10, 0).then((res) => {
    users.value = transformUsers(res.data.records.concat(props.modelValue || [])); // Transform users
  });
});

watch(selectedUser, () => {
  emits('update:modelValue', selectedUser.value);
});

</script>

<style scoped lang="scss">

</style>
