/**
 * useTransferTableYear — shared composable for transfer-type DataTable pages.
 *
 * ## URL query-param convention
 *
 * When `syncQueryParams: true` is passed, the composable reads initial state from the
 * current route query on mount and reflects state changes back to the URL silently
 * (via the history API, without triggering navigation guards).
 *
 * ### Supported query params per table
 *
 * | Table      | `year`             | `search`     | filter keys |
 * | ---------- | ------------------ | ------------ | ----------- |
 * | Invoices   | fiscal year number | invoice ID   | `state`     |
 * | Write-offs | fiscal year number | write-off ID | —           |
 *
 * ### Navigating to a pre-filtered table from another page
 *
 * ```ts
 * router.push({ name: 'invoices', query: { year: '2025', state: 'CREATED' } });
 * router.push({ name: 'invoices', query: { year: '2025', search: '42' } });
 * ```
 */
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useFiscalYear } from '@/composables/fiscalYear';
import { useDataTableYear } from '@/composables/dataTableYear';
import type { DataTableFetchParams, DataTableFetchResult } from '@/utils/pagination';

/** Extends DataTableFetchParams with pre-computed fiscal-year date bounds. */
export interface TransferTableFetchParams<F> extends DataTableFetchParams<F> {
  fiscalStart: string;
  fiscalEnd: string;
}

export function useTransferTableYear<T, F extends Record<string, unknown>>(
  fetchRecords: (params: TransferTableFetchParams<F>) => Promise<DataTableFetchResult<T>>,
  fetchSingleRecord?: (id: number) => Promise<T>,
  options?: {
    initialFilters?: F;
    defaultRows?: number;
    syncQueryParams?: boolean;
  },
) {
  const { getFiscalYearList, getFiscalYearRange } = useFiscalYear();
  const years = getFiscalYearList();
  const { t } = useI18n();
  const toast = useToast();
  const route = useRoute();
  const router = useRouter();

  const syncQueryParams = options?.syncQueryParams ?? false;

  // Snapshot the route name once at setup time so we can guard syncQuery.
  const ownRouteName = route.name;

  // Seed initial table state from URL when syncQueryParams is enabled.
  let initialYear = years[0]!;
  let initialSearchId: number | undefined;
  const initialFilters = { ...(options?.initialFilters || {}) } as F;

  if (syncQueryParams) {
    if (route.query.year) {
      const parsed = Number(route.query.year);
      if (!isNaN(parsed)) initialYear = parsed;
    }
    if (route.query.search) {
      const parsed = Number(route.query.search);
      if (!isNaN(parsed)) initialSearchId = parsed;
    }
    for (const key of Object.keys(initialFilters)) {
      if (route.query[key] !== undefined) {
        (initialFilters as Record<string, unknown>)[key] = route.query[key] as string;
      }
    }
  }

  async function wrappedFetch(params: DataTableFetchParams<F>): Promise<DataTableFetchResult<T>> {
    const { start, end } = getFiscalYearRange(params.year);
    return fetchRecords({ ...params, fiscalStart: start, fiscalEnd: end });
  }

  const table = useDataTableYear<T, F>(wrappedFetch, fetchSingleRecord, {
    yearList: years,
    defaultYear: initialYear,
    initialFilters,
    initialSearch: initialSearchId,
    defaultRows: options?.defaultRows,
  });

  // --- URL sync ---

  // Tracks the last query values we pushed to the URL ourselves.
  let lastSyncedQuery: Record<string, string> = {};

  function buildQuery(): Record<string, string> {
    const query: Record<string, string> = {};
    if (table.year.value) query.year = table.year.value;
    if (table.searchId.value !== undefined) query.search = String(table.searchId.value);
    for (const [key, value] of Object.entries(table.filters.value)) {
      if (value !== undefined && value !== null && typeof value !== 'object') {
        query[key] = (value as string | number | boolean).toString();
      }
    }
    return query;
  }

  function syncQuery() {
    if (!syncQueryParams) return;
    // Guard: skip if we're no longer on the route this composable was set up on.
    if (route.name !== ownRouteName) return;

    const query = buildQuery();

    // Skip if nothing changed since the last sync.
    if (
      Object.keys(query).length === Object.keys(lastSyncedQuery).length &&
      Object.entries(query).every(([k, v]) => lastSyncedQuery[k] === v)
    )
      return;

    // Update the browser URL silently via the low-level history API.
    // Using router.options.history.replace (not router.replace) means we bypass
    // beforeEach navigation guards entirely — no risk of triggering redirects.
    const { fullPath } = router.resolve({ name: ownRouteName as string, query });
    router.options.history.replace(fullPath);

    lastSyncedQuery = { ...query };
  }

  // Sync URL when year or searchId changes.
  watch([table.year, table.searchId], syncQuery);

  // Override setFilter so filter changes are also reflected in the URL.
  function setFilter<K extends keyof F>(key: K, value: F[K]) {
    table.setFilter(key, value);
    syncQuery();
  }

  // --- Search input ---

  const searchInput = ref<string>('');

  function searchById() {
    const id = Number(searchInput.value);
    if (isNaN(id) || !searchInput.value) return;
    table.onSingle(id).catch(() => {
      toast.add({
        severity: 'warn',
        summary: t('common.toast.info.info'),
        detail: t('common.toast.info.notFound'),
        life: 3000,
      });
    });
  }

  return {
    ...table,
    setFilter, // shadowed: also calls syncQuery
    years,
    searchInput,
    searchById,
  };
}
