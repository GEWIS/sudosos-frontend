<template>
  <Dropdown
      v-model="selectedRole"
      :options="roles"
      optionLabel="name"
      :loading="loading"
      :filter="true"
      autoFilterFocus
      :filter-fields="['name']"
      :placeholder="placeholder"
      class="w-full md:w-15rem"
      @filter="filterRoles"
  >

  </Dropdown>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from "vue";
import type { Ref } from "vue";
import apiService from "@/services/ApiService";
import { debounce } from "lodash";
import { type RoleResponse } from "@sudosos/sudosos-client";


const emits = defineEmits(['update:role']);

const props = defineProps({
  role: {
    type: Object as PropType<RoleResponse>,
  },
  default: {
    type: Object as PropType<RoleResponse>,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  take: {
    type: Number,
    required: false,
    default: 10,
  }
});

const lastQuery = ref("");
const selectedRole: Ref<RoleResponse | undefined> = ref(undefined);

const loading = ref(false);
const roles: Ref<RoleResponse[]> = ref([]);



const debouncedSearch = debounce((e: any) => {
  loading.value = true;
  apiService.rbac.getAllRoles().then((res) => {
    roles.value = res.data;
  }).finally(() => {
    loading.value = false;
  });
  lastQuery.value = e.value;
}, 500);

const filterRoles = (e: any) => {
  if (e.value.split(' ')[0] !== lastQuery.value) {
    if (e.value.length < 3) return;
    debouncedSearch(e);
  }
};

onMounted(async () => {
  apiService.rbac.getAllRoles().then((res) => {
    roles.value = res.data;
    if (props.default) {
      selectedRole.value = props.default;
    }
  });
});

watch(selectedRole, () => {
  emits('update:role', selectedRole.value);
});

</script>

<style scoped lang="scss">

</style>
