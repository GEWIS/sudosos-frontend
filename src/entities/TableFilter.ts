export interface TableFilter {
  selfBought: Boolean,
  putInByYou: Boolean,
  putInForYou: Boolean,
  hideHandled: Boolean,
  filterWay: String | null,
  fromDate: String,
  toDate: String,
}

export function initFilter(): TableFilter {
  return {
    selfBought: false,
    putInByYou: false,
    putInForYou: false,
    hideHandled: false,
    filterWay: null,
    fromDate: '',
    toDate: '',
  };
}
