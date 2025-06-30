<template>
  <div>
    <Tabs v-model:value="year" class="w-full">
      <TabList>
        <Tab v-for="yearOption in yearList" :key="yearOption" :value="yearOption.toString()">
          {{ yearOption.toString() }}
        </Tab>
      </TabList>
    </Tabs>

    <!-- Data Table slot -->
    <slot
      :is-loading="isLoading"
      :on-page="onPage"
      :page="page"
      :records="records"
      :reload="reload"
      :rows="rows"
      :total-records="totalRecords"
      @single="onSingle"
      @state-filter-change="setFilter"
    />
  </div>
</template>

<script setup lang="ts" generic="T = unknown, F = Record<string, unknown>">
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  yearList: number[];
  defaultYear: number;
  fetchRecords: (params: {
    year: number | string;
    page: number;
    rows: number;
    filters: F;
  }) => Promise<DataTableFetchResult<T>>;
  fetchSingleRecord?: (id: number) => Promise<T>;
  initialFilters?: F;
  defaultRows?: number;
}>();

interface DataTableFetchResult<T> {
  records: T[];
  _pagination: { count: number; skip: number; take: number };
}

const year = ref(props.defaultYear.toString());
const page = ref(0);
const rows = ref(props.defaultRows ?? 10);
const filters = ref({ ...(props.initialFilters || {}) });
const isLoading = ref(false);
const records = ref([]);
const totalRecords = ref(0);

const reload = async () => {
  isLoading.value = true;
  const resp = await props.fetchRecords({
    year: year.value,
    page: page.value,
    rows: rows.value,
    filters: filters.value,
  });
  records.value = resp.records;
  totalRecords.value = resp._pagination.count || 0;
  isLoading.value = false;
};

function onPage(event) {
  page.value = event.first;
  rows.value = event.rows;
  void reload();
}

function setFilter<K extends keyof F>(key: K, value: F[K]) {
  filters.value[key] = value;
  page.value = 0;
  void reload();
}

async function onSingle(id?: number) {
  if (!id || isNaN(id)) return reload();
  page.value = 0;
  records.value = [await props.fetchSingleRecord(id)];
}

watch([year, () => filters.value], () => {
  page.value = 0;
  void reload();
});

onMounted(reload);

defineExpose({
  onSingle,
  reload,
});
</script>
