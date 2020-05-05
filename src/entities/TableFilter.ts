export interface TableFilter {
  selfBought: Boolean,
  putInByYou: Boolean,
  putInForYou: Boolean,
  filterWay: String | null,
  fromDate: String,
  toDate: String,
  csv?: Boolean,
  reset?: Boolean,
}

export function initFilter(): TableFilter {
  return {
    selfBought: false,
    putInByYou: false,
    putInForYou: false,
    filterWay: null,
    fromDate: '',
    toDate: '',
  };
}
