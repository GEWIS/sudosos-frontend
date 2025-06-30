export interface DataTableFetchParams<F> {
  year: number | string;
  page: number;
  rows: number;
  filters: F;
}

export interface DataTableFetchResult<T> {
  records: T[];
  _pagination: { count: number };
}
